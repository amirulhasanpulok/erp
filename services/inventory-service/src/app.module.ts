import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { StockEntity } from './stock.entity';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockRepository } from './stock.repository';
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
    TypeOrmModule.forFeature([StockEntity, OutboxEventEntity]),
    EventsModule
  ],
  controllers: [HealthController, StockController],
  providers: [StockService, StockRepository, OutboxRepository, OutboxService]
})
export class AppModule {}
