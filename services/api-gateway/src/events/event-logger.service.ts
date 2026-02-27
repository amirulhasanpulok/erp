import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EventLoggerService {
  private readonly logger = new Logger(EventLoggerService.name);

  logPublished(eventId: string, eventType: string, canonicalEventName: string): void {
    this.logger.log(
      JSON.stringify({
        message: 'event-published',
        eventId,
        eventType,
        canonicalEventName
      })
    );
  }

  logConsumed(eventId: string, eventType: string, canonicalEventName: string): void {
    this.logger.log(
      JSON.stringify({
        message: 'event-consumed',
        eventId,
        eventType,
        canonicalEventName
      })
    );
  }

  logRetry(eventId: string, eventType: string, retryCount: number): void {
    this.logger.warn(
      JSON.stringify({
        message: 'event-retry',
        eventId,
        eventType,
        retryCount
      })
    );
  }
}
