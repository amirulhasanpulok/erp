import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { GatewayController } from './gateway/gateway.controller';
import { HealthController } from './health/health.controller';
import { validate } from './common/config/env.validation';
import { EventsModule } from './events/events.module';
import { InternalIpWhitelistMiddleware } from './common/middleware/internal-ip-whitelist.middleware';
import { RateLimitMiddleware } from './common/middleware/rate-limit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate
    }),
    EventsModule
  ],
  controllers: [HealthController, GatewayController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RateLimitMiddleware).forRoutes('*');
    consumer
      .apply(InternalIpWhitelistMiddleware)
      .forRoutes({ path: 'gateway/events/test', method: RequestMethod.POST });
  }
}
