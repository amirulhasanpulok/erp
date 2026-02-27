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
}

