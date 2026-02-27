import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { EventEnvelope } from './event-envelope';
import { RabbitMqService } from './rabbitmq.service';

@Injectable()
export class EventsPublisher {
  private readonly logger = new Logger(EventsPublisher.name);

  constructor(private readonly rabbitMqService: RabbitMqService) {}

  async publish<TData>(
    eventType: EventEnvelope<TData>['eventType'],
    source: string,
    data: TData
  ): Promise<void> {
    const envelope: EventEnvelope<TData> = {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date().toISOString(),
      source,
      version: '1.0',
      data
    };

    await this.rabbitMqService.publish(eventType, Buffer.from(JSON.stringify(envelope)));
    this.logger.log(`Published event ${eventType} (${envelope.eventId})`);
  }
}

