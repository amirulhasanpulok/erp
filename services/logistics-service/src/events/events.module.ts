import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsRepository } from '../logistics.repository';
import { OutboxEventEntity } from '../outbox.entity';
import { OutboxRepository } from '../outbox.repository';
import { OutboxService } from '../outbox.service';
import { ShipmentEntity } from '../shipment.entity';
import { EventsPublisher } from './events.publisher';
import { EventsSubscriber } from './events.subscriber';
import { RabbitMqService } from './rabbitmq.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShipmentEntity, OutboxEventEntity])],
  providers: [
    RabbitMqService,
    EventsPublisher,
    LogisticsRepository,
    OutboxRepository,
    OutboxService,
    EventsSubscriber
  ],
  exports: [EventsPublisher]
})
export class EventsModule {}

