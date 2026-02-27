import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Channel, ConsumeMessage, connect } from 'amqplib';
@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private connection?: Awaited<ReturnType<typeof connect>>;
  private channel?: Channel;
  async onModuleInit(): Promise<void> {
    if (this.channel) return;
    this.connection = await connect(process.env.RABBITMQ_URL ?? 'amqp://erp:erp123@rabbitmq:5672');
    this.channel = await this.connection.createChannel();
    const exchange = process.env.RABBITMQ_EXCHANGE ?? 'erp.events';
    const queue = process.env.RABBITMQ_QUEUE ?? 'logistics-service.events.q';
    const dlq = process.env.RABBITMQ_DLK ?? 'logistics-service.events.dlq';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    await this.channel.assertQueue(dlq, { durable: true });
    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: { 'x-dead-letter-exchange': '', 'x-dead-letter-routing-key': dlq }
    });
    await this.channel.bindQueue(queue, exchange, 'PAYMENT_CONFIRMED');
  }
  publish(routingKey: string, payload: Buffer): boolean {
    if (!this.channel) throw new Error('channel missing');
    return this.channel.publish(process.env.RABBITMQ_EXCHANGE ?? 'erp.events', routingKey, payload, { persistent: true });
  }
  async consume(handler: (message: ConsumeMessage) => Promise<void>): Promise<void> {
    await this.onModuleInit();
    const queue = process.env.RABBITMQ_QUEUE ?? 'logistics-service.events.q';
    await this.channel!.consume(queue, (message) => {
      if (!message) return;
      handler(message).catch(() => this.channel!.nack(message, false, false));
    });
  }
  ack(message: ConsumeMessage): void { this.channel!.ack(message); }
  async onModuleDestroy(): Promise<void> { await this.channel?.close(); await this.connection?.close(); }
}
