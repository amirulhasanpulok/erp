import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import Redis from 'ioredis';
import { PaymentRepository } from '../payment.repository';
import { RabbitMqService } from './rabbitmq.service';

@Injectable()
export class EventsSubscriber implements OnModuleInit {
  private readonly redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379');
  private readonly ttl = Number(process.env.EVENT_IDEMPOTENCY_TTL_SECONDS ?? 86400);

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly paymentRepository: PaymentRepository
  ) {}
  async onModuleInit(): Promise<void> {
    await this.rabbitMqService.consume(async (message) => this.handle(message));
  }
  private async handle(message: ConsumeMessage): Promise<void> {
    const payload = JSON.parse(message.content.toString()) as {
      eventId?: string;
      eventType?: string;
      data?: { orderId?: string; outletId?: string; total?: string | number };
    };
    const id = payload.eventId ?? '';
    if (id) {
      const ok = await this.redis.set(`payment:evt:${id}`, '1', 'EX', this.ttl, 'NX');
      if (!ok) { this.rabbitMqService.ack(message); return; }
    }
    if (payload.eventType === 'ECOM_ORDER_PLACED') {
      const orderId = payload.data?.orderId;
      const outletId = payload.data?.outletId;
      const total = String(payload.data?.total ?? '0');
      if (orderId && outletId) {
        const existing = await this.paymentRepository.findByOrder(orderId);
        if (!existing) {
          await this.paymentRepository.create({
            outletId,
            orderId,
            amount: total,
            status: 'initiated'
          });
        }
      }
    }
    this.rabbitMqService.ack(message);
  }
}
