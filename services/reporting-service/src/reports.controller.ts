import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from './jwt-access.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { ReportsService } from './reports.service';
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles('hq_admin', 'accountant', 'manager')
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
  @Get('sales')
  async sales(@Query('outletId') outletId?: string): Promise<{
    report: string;
    outletId?: string;
    totalEvents: number;
    generatedAt: string;
  }> {
    const summary = await this.reportsService.sales(outletId);
    return { report: 'sales-summary', outletId, totalEvents: summary.totalEvents, generatedAt: new Date().toISOString() };
  }
  @Get('payments')
  async payments(@Query('outletId') outletId?: string): Promise<{
    report: string;
    outletId?: string;
    totalEvents: number;
    generatedAt: string;
  }> {
    const summary = await this.reportsService.payments(outletId);
    return { report: 'payment-summary', outletId, totalEvents: summary.totalEvents, generatedAt: new Date().toISOString() };
  }
  @Get('shipments')
  async shipments(@Query('outletId') outletId?: string): Promise<{
    report: string;
    outletId?: string;
    totalEvents: number;
    generatedAt: string;
  }> {
    const summary = await this.reportsService.shipments(outletId);
    return { report: 'shipment-summary', outletId, totalEvents: summary.totalEvents, generatedAt: new Date().toISOString() };
  }
  @Get('accounting')
  async accounting(@Query('outletId') outletId?: string): Promise<{
    report: string;
    outletId?: string;
    metrics: { totalDebits: string; totalCredits: string };
    generatedAt: string;
  }> {
    const metrics = await this.reportsService.accounting(outletId);
    return {
      report: 'accounting-summary',
      outletId,
      metrics,
      generatedAt: new Date().toISOString()
    };
  }
}
