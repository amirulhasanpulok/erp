import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ConsumeMessage } from 'amqplib';
import { EventEnvelope } from './event-envelope';
import { EventLoggerService } from './event-logger.service';
import { RabbitMqService } from './rabbitmq.service';
import { resolveCanonicalEventName } from './event-naming';

@Injectable()
export class EventsSubscriber implements OnModuleInit {
  private readonly logger = new Logger(EventsSubscriber.name);
  private readonly redisClient: Redis;
  private readonly idempotencyTtlSeconds: number;
  private readonly dlqMaxRetries: number;

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly configService: ConfigService,
    private readonly eventLogger: EventLoggerService
  ) {
    this.redisClient = new Redis(this.configService.getOrThrow<string>('REDIS_URL'));
    this.idempotencyTtlSeconds = this.configService.get<number>(
      'EVENT_IDEMPOTENCY_TTL_SECONDS',
      86400
    );
    this.dlqMaxRetries = this.configService.get<number>('EVENT_DLQ_MAX_RETRIES', 3);
  }

  async onModuleInit(): Promise<void> {
    await this.rabbitMqService.consume(async (message) => {
      await this.handleMessage(message);
    });
    await this.rabbitMqService.consumeDeadLetter(async (message) => {
      await this.handleDeadLetterMessage(message);
    });
  }

  private async handleMessage(message: ConsumeMessage): Promise<void> {
    const payload = JSON.parse(message.content.toString()) as EventEnvelope;
    if (!(await this.isFirstProcess(payload.eventId))) {
      this.logger.warn(`Skipping duplicate event: ${payload.eventId}`);
      this.rabbitMqService.ack(message);
      return;
    }

    this.logger.log(`Received event ${payload.eventType} from ${payload.source}`);
    this.eventLogger.logConsumed(
      payload.eventId,
      payload.eventType,
      payload.canonicalEventName ?? resolveCanonicalEventName(payload.eventType)
    );
    this.rabbitMqService.ack(message);
  }

  private async handleDeadLetterMessage(message: ConsumeMessage): Promise<void> {
    const payload = JSON.parse(message.content.toString()) as EventEnvelope;
    const retryCount = Number(message.properties.headers?.['x-retry-count'] ?? 0);
    if (retryCount >= this.dlqMaxRetries) {
      this.logger.error(
        `DLQ max retries reached for event ${payload.eventId} (${payload.eventType})`
      );
      this.rabbitMqService.ack(message);
      return;
    }

    await this.rabbitMqService.publish(payload.eventType, message.content, {
      headers: {
        ...(message.properties.headers ?? {}),
        'x-retry-count': retryCount + 1
      }
    });
    this.eventLogger.logRetry(payload.eventId, payload.eventType, retryCount + 1);
    this.rabbitMqService.ack(message);
  }

  private async isFirstProcess(eventId: string): Promise<boolean> {
    const key = `event-processed:${eventId}`;

    try {
      const result = await this.redisClient.set(
        key,
        new Date().toISOString(),
        'EX',
        this.idempotencyTtlSeconds,
        'NX'
      );
      return result === 'OK';
    } catch (error) {
      this.logger.warn(
        `Redis idempotency check failed, processing event as fallback: ${(error as Error).message}`
      );
      return true;
    }
  }
}
