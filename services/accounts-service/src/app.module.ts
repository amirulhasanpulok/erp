import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { AccountsRepository } from './accounts.repository';
import { JournalEntryEntity } from './journal-entry.entity';
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
    TypeOrmModule.forFeature([JournalEntryEntity]),
    EventsModule
  ],
  controllers: [HealthController, AccountsController],
  providers: [AccountsService, AccountsRepository, RolesGuard]
})
export class AppModule {}
