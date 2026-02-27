import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import Redis from 'ioredis';
import { LogisticsRepository } from '../logistics.repository';
import { OutboxRepository } from '../outbox.repository';
import { OutboxService } from '../outbox.service';
import { RabbitMqService } from './rabbitmq.service';

@Injectable()
export class EventsSubscriber implements OnModuleInit {
  private readonly redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379');
  private readonly ttl = Number(process.env.EVENT_IDEMPOTENCY_TTL_SECONDS ?? 86400);

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly logisticsRepository: LogisticsRepository,
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
      data?: { orderId?: string; outletId?: string };
    };
    const id = payload.eventId ?? '';
    if (id) {
      const ok = await this.redis.set(`logistics:evt:${id}`, '1', 'EX', this.ttl, 'NX');
      if (!ok) { this.rabbitMqService.ack(message); return; }
    }
    if (payload.eventType === 'PAYMENT_CONFIRMED') {
      const orderId = payload.data?.orderId;
      const outletId = payload.data?.outletId;
      if (orderId && outletId) {
        const existing = await this.logisticsRepository.findByOrder(orderId);
        if (!existing) {
          const trackingId = `AUTO-${Date.now()}`;
          const shipment = await this.logisticsRepository.create({
            orderId,
            outletId,
            provider: 'steadfast',
            trackingId,
            status: 'created'
          });
          const outbox = await this.outboxRepository.create({
            outletId,
            eventType: 'SHIPMENT_CREATED',
            payload: {
              shipmentId: shipment.id,
              orderId: shipment.orderId,
              outletId: shipment.outletId,
              trackingId: shipment.trackingId
            }
          });
          await this.outboxService.dispatch(outbox);
        }
      }
    }
    this.rabbitMqService.ack(message);
  }
}
