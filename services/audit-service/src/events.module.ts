import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { Channel, Connection, ConsumeMessage, connect } from 'amqplib';
import Redis from 'ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditRecordEntity } from './audit-record.entity';
import { AuditRepository } from './audit.repository';
import { AuditService } from './audit.service';

@Injectable()
class AuditEventsSubscriber implements OnModuleInit {
  private channel?: Channel;
  private connection?: Connection;
  private readonly redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379');
  private readonly ttl = Number(process.env.EVENT_IDEMPOTENCY_TTL_SECONDS ?? 86400);
  constructor(private readonly auditService: AuditService) {}

  async onModuleInit(): Promise<void> {
    this.connection = await connect(process.env.RABBITMQ_URL ?? 'amqp://erp:erp123@rabbitmq:5672');
    this.channel = await this.connection.createChannel();
    const exchange = process.env.RABBITMQ_EXCHANGE ?? 'erp.events';
    const queue = process.env.RABBITMQ_QUEUE ?? 'audit-service.events.q';
    const dlq = process.env.RABBITMQ_DLK ?? 'audit-service.events.dlq';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    await this.channel.assertQueue(dlq, { durable: true });
    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: { 'x-dead-letter-exchange': '', 'x-dead-letter-routing-key': dlq }
    });
    await this.channel.bindQueue(queue, exchange, '#');
    await this.channel.consume(queue, (message) => {
      if (!message) return;
      this.handle(message).catch(() => this.channel!.nack(message, false, false));
    });
  }
  private async handle(message: ConsumeMessage): Promise<void> {
    const payload = JSON.parse(message.content.toString()) as {
      eventId?: string;
      source?: string;
      eventType?: string;
      data?: Record<string, unknown>;
    };
    const id = payload.eventId ?? '';
    if (id) {
      const ok = await this.redis.set(`audit:evt:${id}`, '1', 'EX', this.ttl, 'NX');
      if (!ok) { this.channel!.ack(message); return; }
    }
    await this.auditService.writeEventSnapshot({
      source: payload.source ?? 'unknown',
      eventType: payload.eventType ?? 'UNKNOWN_EVENT',
      data: payload.data ?? {},
      outletId: (payload.data?.outletId as string | undefined) ?? null
    });
    this.channel!.ack(message);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([AuditRecordEntity])],
  providers: [AuditRepository, AuditService, AuditEventsSubscriber]
})
export class EventsModule {}
