import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '../payment.entity';
import { PaymentRepository } from '../payment.repository';
import { EventsPublisher } from './events.publisher';
import { RabbitMqService } from './rabbitmq.service';
import { EventsSubscriber } from './events.subscriber';
@Module({
  imports: [TypeOrmModule.forFeature([PaymentEntity])],
  providers: [RabbitMqService, EventsPublisher, PaymentRepository, EventsSubscriber],
  exports: [EventsPublisher]
})
export class EventsModule {}
