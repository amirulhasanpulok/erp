import { Injectable, Module, OnModuleInit } from '@nestjs/common';
import { Channel, Connection, ConsumeMessage, connect } from 'amqplib';
import Redis from 'ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsRepository } from './accounts.repository';
import { JournalEntryEntity } from './journal-entry.entity';

type CanonicalEvent = {
  eventId?: string;
  eventType?: string;
  data?: Record<string, unknown>;
};

@Injectable()
class AccountsEventsSubscriber implements OnModuleInit {
  private channel?: Channel;
  private connection?: Connection;
  private readonly redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379');
  private readonly ttl = Number(process.env.EVENT_IDEMPOTENCY_TTL_SECONDS ?? 86400);

  constructor(private readonly accountsRepository: AccountsRepository) {}

  async onModuleInit(): Promise<void> {
    this.connection = await connect(process.env.RABBITMQ_URL ?? 'amqp://erp:erp123@rabbitmq:5672');
    this.channel = await this.connection.createChannel();
    const exchange = process.env.RABBITMQ_EXCHANGE ?? 'erp.events';
    const queue = process.env.RABBITMQ_QUEUE ?? 'accounts-service.events.q';
    const dlq = process.env.RABBITMQ_DLK ?? 'accounts-service.events.dlq';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    await this.channel.assertQueue(dlq, { durable: true });
    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: { 'x-dead-letter-exchange': '', 'x-dead-letter-routing-key': dlq }
    });
    await this.channel.bindQueue(queue, exchange, 'SALE_CREATED');
    await this.channel.bindQueue(queue, exchange, 'PURCHASE_RECEIVED');
    await this.channel.bindQueue(queue, exchange, 'MANUFACTURE_COMPLETED');

    await this.channel.consume(queue, (message) => {
      if (!message) return;
      this.handle(message).catch(() => this.channel!.nack(message, false, false));
    });
  }

  private async handle(message: ConsumeMessage): Promise<void> {
    const payload = JSON.parse(message.content.toString()) as CanonicalEvent;
    const eventId = payload.eventId ?? '';
    if (eventId) {
      const first = await this.redis.set(`accounts:evt:${eventId}`, '1', 'EX', this.ttl, 'NX');
      if (!first) {
        this.channel!.ack(message);
        return;
      }
    }
    const data = payload.data ?? {};
    const outletId = String(data.outletId ?? '');
    if (!outletId) {
      this.channel!.ack(message);
      return;
    }

    if (payload.eventType === 'SALE_CREATED') {
      await this.accountsRepository.create({
        outletId,
        referenceType: 'sale',
        referenceId: String(data.saleId ?? data.orderId ?? '00000000-0000-0000-0000-000000000000'),
        debitAccount: 'Cash',
        creditAccount: 'Sales Revenue',
        amount: String(data.total ?? '0')
      });
    }
    if (payload.eventType === 'PURCHASE_RECEIVED') {
      await this.accountsRepository.create({
        outletId,
        referenceType: 'purchase',
        referenceId: String(data.purchaseId ?? '00000000-0000-0000-0000-000000000000'),
        debitAccount: 'Inventory',
        creditAccount: 'Accounts Payable',
        amount: String(data.total ?? '0')
      });
    }
    if (payload.eventType === 'MANUFACTURE_COMPLETED') {
      await this.accountsRepository.create({
        outletId,
        referenceType: 'manufacture',
        referenceId: String(data.manufactureId ?? '00000000-0000-0000-0000-000000000000'),
        debitAccount: 'Finished Goods',
        creditAccount: 'Raw Materials',
        amount: String(data.quantity ?? '0')
      });
    }
    this.channel!.ack(message);
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntryEntity])],
  providers: [AccountsRepository, AccountsEventsSubscriber]
})
export class EventsModule {}
