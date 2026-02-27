import { Module } from '@nestjs/common';
import { EventLoggerService } from './event-logger.service';
import { EventsPublisher } from './events.publisher';
import { EventsSubscriber } from './events.subscriber';
import { RabbitMqService } from './rabbitmq.service';

@Module({
  providers: [RabbitMqService, EventLoggerService, EventsPublisher, EventsSubscriber],
  exports: [EventsPublisher]
})
export class EventsModule {}
