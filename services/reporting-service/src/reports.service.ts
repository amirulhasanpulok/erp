import { Injectable } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';

@Injectable()
export class ReportsService {
  constructor(private readonly repository: ReportsRepository) {}

  async sales(outletId?: string): Promise<{ totalEvents: number }> {
    return { totalEvents: await this.repository.sumByEvent(outletId, ['SALE_CREATED']) };
  }

  async payments(outletId?: string): Promise<{ totalEvents: number }> {
    return { totalEvents: await this.repository.sumByEvent(outletId, ['PAYMENT_CONFIRMED']) };
  }

  async shipments(outletId?: string): Promise<{ totalEvents: number }> {
    return {
      totalEvents: await this.repository.sumByEvent(outletId, [
        'SHIPMENT_CREATED',
        'DELIVERY_STATUS_UPDATED'
      ])
    };
  }

  async accounting(outletId?: string): Promise<{ totalDebits: string; totalCredits: string }> {
    const value = await this.repository.sumByEvent(outletId, [
      'SALE_CREATED',
      'PURCHASE_RECEIVED',
      'MANUFACTURE_COMPLETED'
    ]);
    return {
      totalDebits: value.toFixed(2),
      totalCredits: value.toFixed(2)
    };
  }

  async kpis(outletId?: string): Promise<
    Array<{
      outletId: string;
      salesEvents: number;
      paymentEvents: number;
      shipmentEvents: number;
      totalEvents: number;
      snapshotDate: string;
    }>
  > {
    await this.repository.refreshKpiMaterializedView();
    return this.repository.kpis(outletId);
  }
}
