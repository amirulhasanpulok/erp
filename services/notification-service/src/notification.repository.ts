import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>
  ) {}

  create(data: Partial<NotificationEntity>): Promise<NotificationEntity> {
    return this.repo.save(this.repo.create(data));
  }

  async markSent(id: string): Promise<void> {
    await this.repo.update({ id }, { status: 'sent' });
  }

  async markFailed(id: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({
        status: 'failed',
        attemptCount: () => '"attempt_count" + 1'
      })
      .where('id = :id', { id })
      .execute();
  }

  list(
    outletId?: string,
    status?: string,
    limit = 50
  ): Promise<NotificationEntity[]> {
    const qb = this.repo.createQueryBuilder('n').orderBy('n.created_at', 'DESC').limit(limit);
    if (outletId) qb.andWhere('n.outlet_id = :outletId', { outletId });
    if (status) qb.andWhere('n.status = :status', { status });
    return qb.getMany();
  }
}
