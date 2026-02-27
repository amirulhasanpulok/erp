import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { InjectDataSource } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';
import { OutboxRepository } from '../outbox.repository';
import { OutboxService } from '../outbox.service';
import { StockEntity } from '../stock.entity';
import { RabbitMqService } from './rabbitmq.service';

type IncomingEvent = {
  eventId?: string;
  eventType?: string;
  data?: {
    outletId?: string;
    productId?: string;
    quantity?: string | number;
  };
};

@Injectable()
export class EventsSubscriber implements OnModuleInit {
  private readonly redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379');
  private readonly ttl = Number(process.env.EVENT_IDEMPOTENCY_TTL_SECONDS ?? 86400);

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly outboxRepository: OutboxRepository,
    private readonly outboxService: OutboxService,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

  async onModuleInit(): Promise<void> {
    await this.rabbitMqService.consume(async (message) => this.handle(message));
  }

  private async handle(message: ConsumeMessage): Promise<void> {
    const payload = JSON.parse(message.content.toString()) as IncomingEvent;
    const eventId = payload.eventId ?? '';
    if (eventId) {
      const first = await this.redis.set(`inventory:evt:${eventId}`, '1', 'EX', this.ttl, 'NX');
      if (!first) {
        this.rabbitMqService.ack(message);
        return;
      }
    }

    const data = payload.data ?? {};
    const outletId = data.outletId ?? '';
    const productId = data.productId ?? '';
    const quantity = Number(data.quantity ?? 0);
    if (!outletId || !productId || !quantity) {
      this.rabbitMqService.ack(message);
      return;
    }

    let delta = 0;
    if (payload.eventType === 'SALE_CREATED') delta = -Math.abs(quantity);
    if (payload.eventType === 'PURCHASE_RECEIVED') delta = Math.abs(quantity);
    if (payload.eventType === 'MANUFACTURE_COMPLETED') delta = Math.abs(quantity);
    if (!delta) {
      this.rabbitMqService.ack(message);
      return;
    }

    const outbox = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(StockEntity);
      const ex = await repo.findOne({ where: { outletId, productId } });
      const entity = ex ?? repo.create({ outletId, productId, quantity: '0' });
      entity.quantity = (Number(entity.quantity) + delta).toFixed(2);
      await repo.save(entity);
      return this.outboxRepository.create(
        {
          outletId,
          eventType: 'STOCK_UPDATED',
          payload: {
            outletId,
            productId,
            quantity: entity.quantity,
            delta: delta.toFixed(2),
            causeEventType: payload.eventType
          }
        },
        manager
      );
    });
    await this.outboxService.dispatch(outbox);

    this.rabbitMqService.ack(message);
  }
}
