import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditController } from './audit.controller';
import { AuditRecordEntity } from './audit-record.entity';
import { AuditRepository } from './audit.repository';
import { AuditService } from './audit.service';
import { EventsModule } from './events.module';
import { HealthController } from './health.controller';
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
        autoLoadEntities: true,
        synchronize: false
      })
    }),
    TypeOrmModule.forFeature([AuditRecordEntity]),
    EventsModule
  ],
  controllers: [HealthController, AuditController],
  providers: [RolesGuard, AuditRepository, AuditService]
})
export class AppModule {}
