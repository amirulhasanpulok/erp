import { Module } from '@nestjs/common';
import { EventsPublisher } from './events.publisher';
import { RabbitMqService } from './rabbitmq.service';
import { EventsSubscriber } from './events.subscriber';

@Module({
  providers: [RabbitMqService, EventsPublisher, EventsSubscriber],
  exports: [EventsPublisher]
})
export class EventsModule {}
