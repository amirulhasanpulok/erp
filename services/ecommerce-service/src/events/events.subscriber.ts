import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import Redis from 'ioredis';
import { EcommerceRepository } from '../ecommerce.repository';
import { OutboxRepository } from '../outbox.repository';
import { OutboxService } from '../outbox.service';
import { RabbitMqService } from './rabbitmq.service';

@Injectable()
export class EventsSubscriber implements OnModuleInit {
  private readonly redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379');
  private readonly ttl = Number(process.env.EVENT_IDEMPOTENCY_TTL_SECONDS ?? 86400);
  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly ecommerceRepository: EcommerceRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly outboxService: OutboxService
  ) {}
  async onModuleInit(): Promise<void> {
    await this.rabbitMqService.consume(async (message) => this.handle(message));
  }
  private async handle(message: ConsumeMessage): Promise<void> {
    const payload = JSON.parse(message.content.toString()) as {
      eventId?: string;
      eventType?: string;
      data?: { orderId?: string; status?: string };
    };
    const id = payload.eventId ?? '';
    if (id) {
      const ok = await this.redis.set(`ecom:evt:${id}`, '1', 'EX', this.ttl, 'NX');
      if (!ok) { this.rabbitMqService.ack(message); return; }
    }
    if (payload.eventType === 'PAYMENT_CONFIRMED' && payload.data?.orderId) {
      await this.ecommerceRepository.updateStatus(payload.data.orderId, 'confirmed');
      const order = await this.ecommerceRepository.findById(payload.data.orderId);
      if (order) {
        const outbox = await this.outboxRepository.create({
          outletId: order.outletId,
          eventType: 'SALE_CREATED',
          payload: {
            saleId: order.id,
            outletId: order.outletId,
            productId: order.productId,
            quantity: order.quantity,
            total: order.total
          }
        });
        await this.outboxService.dispatch(outbox);
      }
    }
    if (payload.eventType === 'DELIVERY_STATUS_UPDATED' && payload.data?.orderId) {
      await this.ecommerceRepository.updateStatus(payload.data.orderId, payload.data.status ?? 'shipped');
    }
    this.rabbitMqService.ack(message);
  }
}
