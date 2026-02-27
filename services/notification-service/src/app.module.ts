import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events.module';
import { HealthController } from './health.controller';
import { NotificationEntity } from './notification.entity';
import { NotificationRepository } from './notification.repository';
import { NotificationsController } from './notifications.controller';
import { RolesGuard } from './roles.guard';

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
    TypeOrmModule.forFeature([NotificationEntity]),
    EventsModule
  ],
  controllers: [HealthController, NotificationsController],
  providers: [NotificationRepository, RolesGuard]
})
export class AppModule {}
