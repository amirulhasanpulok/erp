import { Module } from '@nestjs/common';
import { EventsPublisher } from './events.publisher';
import { EventsSubscriber } from './events.subscriber';
import { RabbitMqService } from './rabbitmq.service';

@Module({
  providers: [RabbitMqService, EventsPublisher, EventsSubscriber],
  exports: [EventsPublisher]
})
export class EventsModule {}

