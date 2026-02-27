import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsumeMessage } from 'amqplib';
import Redis from 'ioredis';
import { EventEnvelope } from './event-envelope';
import { RabbitMqService } from './rabbitmq.service';

@Injectable()
export class EventsSubscriber implements OnModuleInit {
  private readonly logger = new Logger(EventsSubscriber.name);
  private readonly redisClient: Redis;
  private readonly idempotencyTtlSeconds: number;

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly configService: ConfigService
  ) {
    this.redisClient = new Redis(this.configService.getOrThrow<string>('REDIS_URL'));
    this.idempotencyTtlSeconds = this.configService.get<number>(
      'EVENT_IDEMPOTENCY_TTL_SECONDS',
      86400
    );
  }

  async onModuleInit(): Promise<void> {
    await this.rabbitMqService.consume(async (message) => {
      await this.handleMessage(message);
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
        `Redis idempotency failed, fallback to process: ${(error as Error).message}`
      );
      return true;
    }
  }
}

