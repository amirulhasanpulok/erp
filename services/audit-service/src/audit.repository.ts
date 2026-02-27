import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditRecordEntity } from './audit-record.entity';

@Injectable()
export class AuditRepository {
  constructor(
    @InjectRepository(AuditRecordEntity)
    private readonly repo: Repository<AuditRecordEntity>
  ) {}

  create(data: Partial<AuditRecordEntity>): Promise<AuditRecordEntity> {
    return this.repo.save(this.repo.create(data));
  }

  list(
    outletId?: string,
    eventType?: string,
    source?: string,
    limit = 100
  ): Promise<AuditRecordEntity[]> {
    const qb = this.repo.createQueryBuilder('a').orderBy('a.created_at', 'DESC').limit(limit);
    if (outletId) qb.andWhere('a.outlet_id = :outletId', { outletId });
    if (eventType) qb.andWhere('a.event_type = :eventType', { eventType });
    if (source) qb.andWhere('a.source = :source', { source });
    return qb.getMany();
  }
}
