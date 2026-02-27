import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import Redis from 'ioredis';
import { RabbitMqService } from './rabbitmq.service';

@Injectable()
export class EventsSubscriber implements OnModuleInit {
  private readonly redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379');
  private readonly ttl = Number(process.env.EVENT_IDEMPOTENCY_TTL_SECONDS ?? 86400);

  constructor(private readonly rabbitMqService: RabbitMqService) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitMqService.consume(async (message) => this.handle(message));
  }

  private async handle(message: ConsumeMessage): Promise<void> {
    const payload = JSON.parse(message.content.toString()) as { eventId?: string };
    const id = payload.eventId ?? '';
    if (id) {
      const ok = await this.redis.set(`sales:evt:${id}`, '1', 'EX', this.ttl, 'NX');
      if (!ok) {
        this.rabbitMqService.ack(message);
        return;
      }
    }
    this.rabbitMqService.ack(message);
  }
}

