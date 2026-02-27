import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EcommerceRepository } from '../ecommerce.repository';
import { OutboxEventEntity } from '../outbox.entity';
import { OutboxRepository } from '../outbox.repository';
import { OutboxService } from '../outbox.service';
import { EcommerceOrderEntity } from '../order.entity';
import { EventsPublisher } from './events.publisher';
import { EventsSubscriber } from './events.subscriber';
import { RabbitMqService } from './rabbitmq.service';
@Module({
  imports: [TypeOrmModule.forFeature([EcommerceOrderEntity, OutboxEventEntity])],
  providers: [
    RabbitMqService,
    EventsPublisher,
    EventsSubscriber,
    EcommerceRepository,
    OutboxRepository,
    OutboxService
  ],
  exports: [EventsPublisher]
})
export class EventsModule {}
