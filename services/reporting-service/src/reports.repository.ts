import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportMetricEntity } from './report-metric.entity';

@Injectable()
export class ReportsRepository {
  constructor(
    @InjectRepository(ReportMetricEntity)
    private readonly repo: Repository<ReportMetricEntity>
  ) {}

  async increment(outletId: string, eventType: string): Promise<void> {
    let row = await this.repo.findOne({ where: { outletId, eventType } });
    if (!row) {
      row = this.repo.create({ outletId, eventType, count: 0 });
    }
    row.count += 1;
    await this.repo.save(row);
  }

  async sumByEvent(outletId: string | undefined, eventTypes: string[]): Promise<number> {
    const qb = this.repo
      .createQueryBuilder('m')
      .select('COALESCE(SUM(m.count), 0)', 'total')
      .where('m.event_type IN (:...eventTypes)', { eventTypes });
    if (outletId) qb.andWhere('m.outlet_id = :outletId', { outletId });
    const result = await qb.getRawOne<{ total: string }>();
    return Number(result?.total ?? 0);
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
    const qb = this.repo.manager
      .createQueryBuilder()
      .select('k.outlet_id', 'outletId')
      .addSelect('k.sales_events', 'salesEvents')
      .addSelect('k.payment_events', 'paymentEvents')
      .addSelect('k.shipment_events', 'shipmentEvents')
      .addSelect('k.total_events', 'totalEvents')
      .addSelect('k.snapshot_date', 'snapshotDate')
      .from('mv_reporting_kpis', 'k');

    if (outletId) {
      qb.where('k.outlet_id = :outletId', { outletId });
    }

    const rows = await qb.getRawMany<{
      outletId: string;
      salesEvents: string;
      paymentEvents: string;
      shipmentEvents: string;
      totalEvents: string;
      snapshotDate: string;
    }>();

    return rows.map((row) => ({
      outletId: row.outletId,
      salesEvents: Number(row.salesEvents ?? 0),
      paymentEvents: Number(row.paymentEvents ?? 0),
      shipmentEvents: Number(row.shipmentEvents ?? 0),
      totalEvents: Number(row.totalEvents ?? 0),
      snapshotDate: row.snapshotDate
    }));
  }

  async refreshKpiMaterializedView(): Promise<void> {
    await this.repo.query('REFRESH MATERIALIZED VIEW mv_reporting_kpis');
  }
}
