import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { EventEnvelope } from './event-envelope';
import { RabbitMqService } from './rabbitmq.service';

@Injectable()
export class EventsPublisher {
  constructor(private readonly rabbitMqService: RabbitMqService) {}

  publish<TData>(eventType: string, source: string, data: TData): EventEnvelope<TData> {
    const envelope: EventEnvelope<TData> = {
      eventId: randomUUID(),
      eventType,
      timestamp: new Date().toISOString(),
      source,
      version: '1.0',
      data
    };
    this.rabbitMqService.publish(eventType, Buffer.from(JSON.stringify(envelope)));
    return envelope;
  }
}

