import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { Channel, ConsumeMessage, connect } from 'amqplib';
import Redis from 'ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportMetricEntity } from './report-metric.entity';
import { ReportsRepository } from './reports.repository';

@Injectable()
class ReportingEventsSubscriber implements OnModuleInit {
  private channel?: Channel;
  private connection?: Awaited<ReturnType<typeof connect>>;
  private readonly redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379');
  private readonly ttl = Number(process.env.EVENT_IDEMPOTENCY_TTL_SECONDS ?? 86400);
  constructor(private readonly reportsRepository: ReportsRepository) {}

  async onModuleInit(): Promise<void> {
    this.connection = await connect(process.env.RABBITMQ_URL ?? 'amqp://erp:erp123@rabbitmq:5672');
    this.channel = await this.connection.createChannel();
    const exchange = process.env.RABBITMQ_EXCHANGE ?? 'erp.events';
    const queue = process.env.RABBITMQ_QUEUE ?? 'reporting-service.events.q';
    const dlq = process.env.RABBITMQ_DLK ?? 'reporting-service.events.dlq';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    await this.channel.assertQueue(dlq, { durable: true });
    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: { 'x-dead-letter-exchange': '', 'x-dead-letter-routing-key': dlq }
    });
    for (const key of ['SALE_CREATED','PURCHASE_RECEIVED','MANUFACTURE_COMPLETED','PAYMENT_CONFIRMED','SHIPMENT_CREATED','DELIVERY_STATUS_UPDATED']) {
      await this.channel.bindQueue(queue, exchange, key);
    }
    await this.channel.consume(queue, (message) => {
      if (!message) return;
      this.handle(message).catch(() => this.channel!.nack(message, false, false));
    });
  }
  private async handle(message: ConsumeMessage): Promise<void> {
    const payload = JSON.parse(message.content.toString()) as {
      eventId?: string;
      eventType?: string;
      data?: { outletId?: string };
    };
    const id = payload.eventId ?? '';
    if (id) {
      const ok = await this.redis.set(`report:evt:${id}`, '1', 'EX', this.ttl, 'NX');
      if (!ok) { this.channel!.ack(message); return; }
    }
    const outletId = payload.data?.outletId;
    const eventType = payload.eventType;
    if (outletId && eventType) {
      await this.reportsRepository.increment(outletId, eventType);
    }
    this.channel!.ack(message);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([ReportMetricEntity])],
  providers: [ReportsRepository, ReportingEventsSubscriber]
})
export class EventsModule {}
