import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from './jwt-access.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { AuditService } from './audit.service';
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles('hq_admin', 'auditor')
@Controller({ path: 'audits', version: '1' })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  list(
    @Query('outletId') outletId?: string,
    @Query('eventType') eventType?: string,
    @Query('source') source?: string,
    @Query('limit') limit?: string
  ) {
    return this.auditService.list(outletId, eventType, source, limit ? Number(limit) : 100);
  }

  @Post()
  write(@Body() body: Record<string, unknown>): Promise<{ status: string; id: string }> {
    return this.auditService.writeManual(body);
  }
}
