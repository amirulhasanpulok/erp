import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { EventEnvelope } from './event-envelope';
import { EventLoggerService } from './event-logger.service';
import { RabbitMqService } from './rabbitmq.service';
import { resolveCanonicalEventName } from './event-naming';

@Injectable()
export class EventsPublisher {
  private readonly logger = new Logger(EventsPublisher.name);

  constructor(
    private readonly rabbitMqService: RabbitMqService,
    private readonly eventLogger: EventLoggerService
  ) {}

  async publish<TData>(
    eventType: EventEnvelope<TData>['eventType'],
    source: string,
    data: TData
  ): Promise<void> {
    const canonicalEventName = resolveCanonicalEventName(eventType);
    const envelope: EventEnvelope<TData> = {
      eventId: uuidv4(),
      eventType,
      canonicalEventName,
      timestamp: new Date().toISOString(),
      source,
      version: '1.0',
      data,
      metadata: {
        emittedBy: 'api-gateway',
        namingConvention: 'erp.<domain>.<entity>.<action>'
      }
    };

    await this.rabbitMqService.publish(eventType, Buffer.from(JSON.stringify(envelope)));
    this.eventLogger.logPublished(envelope.eventId, eventType, canonicalEventName);
    this.logger.log(`Published event ${eventType} (${envelope.eventId})`);
  }
}
