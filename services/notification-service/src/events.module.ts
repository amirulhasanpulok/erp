import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Connection, ConsumeMessage, connect } from 'amqplib';
import Redis from 'ioredis';
import { NotificationEntity } from './notification.entity';
import { NotificationRepository } from './notification.repository';

type CanonicalEvent = {
  eventId?: string;
  eventType?: string;
  data?: Record<string, unknown>;
};

@Injectable()
class NotificationEventsSubscriber implements OnModuleInit {
  private channel?: Channel;
  private connection?: Connection;
  private readonly redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379');
  private readonly ttl = Number(process.env.EVENT_IDEMPOTENCY_TTL_SECONDS ?? 86400);

  constructor(private readonly notificationRepository: NotificationRepository) {}

  async onModuleInit(): Promise<void> {
    this.connection = await connect(process.env.RABBITMQ_URL ?? 'amqp://erp:erp123@rabbitmq:5672');
    this.channel = await this.connection.createChannel();
    const exchange = process.env.RABBITMQ_EXCHANGE ?? 'erp.events';
    const queue = process.env.RABBITMQ_QUEUE ?? 'notification-service.events.q';
    const dlq = process.env.RABBITMQ_DLK ?? 'notification-service.events.dlq';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    await this.channel.assertQueue(dlq, { durable: true });
    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: { 'x-dead-letter-exchange': '', 'x-dead-letter-routing-key': dlq }
    });
    for (const key of [
      'SALE_CREATED',
      'PURCHASE_RECEIVED',
      'MANUFACTURE_COMPLETED',
      'ECOM_ORDER_PLACED',
      'STOCK_UPDATED',
      'PAYMENT_CONFIRMED',
      'SHIPMENT_CREATED',
      'DELIVERY_STATUS_UPDATED'
    ]) {
      await this.channel.bindQueue(queue, exchange, key);
    }
    await this.channel.consume(queue, (message) => {
      if (!message) return;
      this.handle(message).catch(() => this.channel!.nack(message, false, false));
    });
  }

  private async handle(message: ConsumeMessage): Promise<void> {
    const payload = JSON.parse(message.content.toString()) as CanonicalEvent;
    const eventId = payload.eventId ?? '';
    if (eventId) {
      const ok = await this.redis.set(`notification:evt:${eventId}`, '1', 'EX', this.ttl, 'NX');
      if (!ok) {
        this.channel!.ack(message);
        return;
      }
    }

    const row = await this.notificationRepository.create({
      outletId: (payload.data?.outletId as string | undefined) ?? null,
      eventId: payload.eventId ?? 'unknown',
      eventType: payload.eventType ?? 'UNKNOWN',
      channel: 'email',
      status: 'queued',
      attemptCount: 0,
      payload: payload.data ?? {}
    });

    try {
      // Placeholder sender: external provider integration can replace this point.
      await this.notificationRepository.markSent(row.id);
    } catch {
      await this.notificationRepository.markFailed(row.id);
    }

    this.channel!.ack(message);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity])],
  providers: [NotificationRepository, NotificationEventsSubscriber]
})
export class EventsModule {}

