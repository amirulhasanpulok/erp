import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { EventsPublisher } from '../events/events.publisher';
import { PublishTestEventDto } from './dto/publish-test-event.dto';

@ApiTags('gateway')
@Controller({ path: 'gateway', version: '1' })
export class GatewayController {
  constructor(private readonly eventsPublisher: EventsPublisher) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('hq_admin', 'manager', 'developer')
  @Get('routes')
  getRoutes(): Record<string, string> {
    return {
      auth: '/api/v1/auth/*',
      users: '/api/v1/users/*',
      outlets: '/api/v1/outlets/*',
      products: '/api/v1/products/*',
      inventory: '/api/v1/inventory/*',
      sales: '/api/v1/sales/*',
      purchases: '/api/v1/purchases/*',
      accounts: '/api/v1/accounts/*',
      manufacturing: '/api/v1/manufacturing/*',
      ecommerce: '/api/v1/ecommerce/*',
      reporting: '/api/v1/reports/*',
      notifications: '/api/v1/notifications/*',
      audits: '/api/v1/audits/*',
      logistics: '/api/v1/logistics/*',
      payments: '/api/v1/payments/*'
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles('hq_admin', 'developer')
  @Permissions('events.publish')
  @Post('events/test')
  async publishTestEvent(@Body() body: PublishTestEventDto): Promise<{ status: string }> {
    await this.eventsPublisher.publish(body.eventType, body.source ?? 'api-gateway', body.data);
    return { status: 'published' };
  }
}
