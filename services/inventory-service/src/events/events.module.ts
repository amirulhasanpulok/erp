import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEventEntity } from '../outbox.entity';
import { OutboxRepository } from '../outbox.repository';
import { OutboxService } from '../outbox.service';
import { EventsPublisher } from './events.publisher';
import { RabbitMqService } from './rabbitmq.service';
import { EventsSubscriber } from './events.subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([OutboxEventEntity])],
  providers: [RabbitMqService, EventsPublisher, EventsSubscriber, OutboxRepository, OutboxService],
  exports: [EventsPublisher]
})
export class EventsModule {}
