import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { OutletEntity } from './outlet.entity';
import { OutletController } from './outlet.controller';
import { OutletService } from './outlet.service';
import { OutletRepository } from './outlet.repository';

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
        synchronize: false,
        autoLoadEntities: true
      })
    }),
    TypeOrmModule.forFeature([OutletEntity])
  ],
  controllers: [HealthController, OutletController],
  providers: [OutletService, OutletRepository]
})
export class AppModule {}

