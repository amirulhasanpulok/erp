import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManufacturingEntity } from './manufacturing.entity';
import { ManufacturingController } from './manufacturing.controller';
import { ManufacturingService } from './manufacturing.service';
import { ManufacturingRepository } from './manufacturing.repository';
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
        autoLoadEntities: true,
        synchronize: false
      })
    }),
    TypeOrmModule.forFeature([ManufacturingEntity, OutboxEventEntity]),
    EventsModule
  ],
  controllers: [HealthController, ManufacturingController],
  providers: [ManufacturingService, ManufacturingRepository, OutboxRepository, OutboxService]
})
export class AppModule {}
