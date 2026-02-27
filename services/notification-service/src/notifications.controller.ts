import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from './jwt-access.guard';
import { NotificationRepository } from './notification.repository';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@UseGuards(JwtAccessGuard, RolesGuard)
@Roles('hq_admin', 'manager', 'support')
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly repository: NotificationRepository) {}

  @Get()
  list(
    @Query('outletId') outletId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string
  ) {
    return this.repository.list(outletId, status, limit ? Number(limit) : 50);
  }
}
