import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ConsumeMessage, connect } from 'amqplib';

@Injectable()
export class RabbitMqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMqService.name);
  private connection?: Awaited<ReturnType<typeof connect>>;
  private channel?: Channel;
  private initializing?: Promise<void>;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    if (this.channel) return;
    await this.initializeChannel();
  }

  private async initializeChannel(): Promise<void> {
    if (this.channel) {
      return;
    }
    if (this.initializing) {
      await this.initializing;
      return;
    }

    this.initializing = (async () => {
    const url = this.configService.getOrThrow<string>('RABBITMQ_URL');
    const exchange = this.configService.get<string>('RABBITMQ_EXCHANGE', 'erp.events');
    const queue = this.configService.get<string>('RABBITMQ_QUEUE', 'api-gateway.events.q');
    const deadLetterQueue = this.configService.get<string>('RABBITMQ_DLK', 'api-gateway.events.dlq');

    this.connection = await connect(url);
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    await this.channel.assertQueue(deadLetterQueue, { durable: true });
    await this.channel.assertQueue(queue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': deadLetterQueue
      }
    });

    const routingKeys = [
      'SALE_CREATED',
      'PURCHASE_RECEIVED',
      'MANUFACTURE_COMPLETED',
      'ECOM_ORDER_PLACED',
      'STOCK_UPDATED',
      'PAYMENT_CONFIRMED',
      'SHIPMENT_CREATED',
      'DELIVERY_STATUS_UPDATED'
    ];

    for (const key of routingKeys) {
      await this.channel.bindQueue(queue, exchange, key);
    }

    this.logger.log(`RabbitMQ ready: exchange=${exchange}, queue=${queue}`);
    })();

    try {
      await this.initializing;
    } finally {
      this.initializing = undefined;
    }
  }

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }
    return this.channel;
  }

  async publish(routingKey: string, payload: Buffer): Promise<boolean> {
    const exchange = this.configService.get<string>('RABBITMQ_EXCHANGE', 'erp.events');
    return this.getChannel().publish(exchange, routingKey, payload, {
      contentType: 'application/json',
      persistent: true
    });
  }

  async consume(onMessage: (message: ConsumeMessage) => Promise<void>): Promise<void> {
    await this.initializeChannel();
    const queue = this.configService.get<string>('RABBITMQ_QUEUE', 'api-gateway.events.q');
    await this.getChannel().consume(queue, (msg) => {
      if (!msg) {
        return;
      }
      onMessage(msg).catch((error: Error) => {
        this.logger.error(`Message processing failed: ${error.message}`);
        this.getChannel().nack(msg, false, false);
      });
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
