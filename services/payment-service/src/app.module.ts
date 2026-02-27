import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { HealthController } from './health.controller';
import { EventsModule } from './events/events.module';
import { OutboxEventEntity } from './outbox.entity';
import { OutboxRepository } from './outbox.repository';
import { OutboxService } from './outbox.service';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'postgres',
        host: c.get('DB_HOST'),
        port: Number(c.get('DB_PORT', 5432)),
        username: c.get('DB_USER'),
        password: c.get('DB_PASSWORD'),
        database: c.get('DB_NAME'),
        ssl: String(process.env.DB_SSL ?? 'false').toLowerCase() === 'true' ? { rejectUnauthorized: false } : false,
        autoLoadEntities: true,
        synchronize: false
      })
    }),
    TypeOrmModule.forFeature([PaymentEntity, OutboxEventEntity]),
    EventsModule
  ],
  controllers: [HealthController, PaymentController],
  providers: [PaymentService, PaymentRepository, OutboxRepository, OutboxService]
})
export class AppModule {}
