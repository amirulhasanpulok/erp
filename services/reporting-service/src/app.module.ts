import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events.module';
import { HealthController } from './health.controller';
import { ReportMetricEntity } from './report-metric.entity';
import { ReportsController } from './reports.controller';
import { ReportsRepository } from './reports.repository';
import { ReportsService } from './reports.service';
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
    TypeOrmModule.forFeature([ReportMetricEntity]),
    EventsModule
  ],
  controllers: [HealthController, ReportsController],
  providers: [RolesGuard, ReportsRepository, ReportsService]
})
export class AppModule {}
