import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { OutboxEventEntity } from './outbox.entity';

@Injectable()
export class OutboxRepository {
  constructor(@InjectRepository(OutboxEventEntity) private readonly repo: Repository<OutboxEventEntity>) {}

  create(data: Partial<OutboxEventEntity>, manager?: EntityManager): Promise<OutboxEventEntity> {
    const r = manager ? manager.getRepository(OutboxEventEntity) : this.repo;
    return r.save(r.create(data));
  }

  async markPublished(id: string): Promise<void> {
    await this.repo.update({ id }, { status: 'published', publishedAt: new Date() });
  }

  listPending(limit = 100): Promise<OutboxEventEntity[]> {
    return this.repo.find({ where: { status: 'pending' }, order: { createdAt: 'ASC' }, take: limit });
  }
}
