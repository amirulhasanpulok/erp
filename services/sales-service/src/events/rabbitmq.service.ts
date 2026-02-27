import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Channel, ConsumeMessage, connect } from 'amqplib';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection?: Awaited<ReturnType<typeof connect>>;
  private channel?: Channel;

  async onModuleInit(): Promise<void> {
    if (this.channel) return;
    const url = process.env.RABBITMQ_URL ?? 'amqp://erp:erp123@rabbitmq:5672';
    this.connection = await connect(url);
    this.channel = await this.connection.createChannel();
    const exchange = process.env.RABBITMQ_EXCHANGE ?? 'erp.events';
    const queue = process.env.RABBITMQ_QUEUE ?? 'sales-service.events.q';
    const dlq = process.env.RABBITMQ_DLK ?? 'sales-service.events.dlq';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    await this.channel.assertQueue(dlq, { durable: true });
    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: { 'x-dead-letter-exchange': '', 'x-dead-letter-routing-key': dlq }
    });
    for (const key of ['ECOM_ORDER_PLACED', 'PAYMENT_CONFIRMED']) {
      await this.channel.bindQueue(queue, exchange, key);
    }
    this.logger.log('RabbitMQ connected');
  }

  getChannel(): Channel {
    if (!this.channel) throw new Error('RabbitMQ channel unavailable');
    return this.channel;
  }

  publish(routingKey: string, payload: Buffer): boolean {
    return this.getChannel().publish(process.env.RABBITMQ_EXCHANGE ?? 'erp.events', routingKey, payload, {
      contentType: 'application/json',
      persistent: true
    });
  }

  async consume(handler: (message: ConsumeMessage) => Promise<void>): Promise<void> {
    await this.onModuleInit();
    const queue = process.env.RABBITMQ_QUEUE ?? 'sales-service.events.q';
    await this.getChannel().consume(queue, (message) => {
      if (!message) return;
      handler(message).catch(() => this.getChannel().nack(message, false, false));
    });
  }

  ack(message: ConsumeMessage): void {
    this.getChannel().ack(message);
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
