import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from './jwt-access.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { ReportsService } from './reports.service';
import { Response } from 'express';
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

  @Get('kpis')
  async kpis(@Query('outletId') outletId?: string): Promise<{
    report: string;
    outletId?: string;
    rows: Array<{
      outletId: string;
      salesEvents: number;
      paymentEvents: number;
      shipmentEvents: number;
      totalEvents: number;
      snapshotDate: string;
    }>;
    generatedAt: string;
  }> {
    const rows = await this.reportsService.kpis(outletId);
    return {
      report: 'kpi-summary',
      outletId,
      rows,
      generatedAt: new Date().toISOString()
    };
  }

  @Get('kpis/export.csv')
  async exportKpisCsv(@Query('outletId') outletId: string | undefined, @Res() res: Response): Promise<void> {
    const rows = await this.reportsService.kpis(outletId);
    const lines = [
      'snapshotDate,outletId,salesEvents,paymentEvents,shipmentEvents,totalEvents',
      ...rows.map((row) =>
        [
          row.snapshotDate,
          row.outletId,
          row.salesEvents,
          row.paymentEvents,
          row.shipmentEvents,
          row.totalEvents
        ].join(',')
      )
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=\"kpis.csv\"');
    res.status(200).send(lines.join('\\n'));
  }
}
