import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseEntity } from './purchase.entity';
@Injectable()
export class PurchaseRepository {
  constructor(@InjectRepository(PurchaseEntity) private readonly repo: Repository<PurchaseEntity>) {}
  create(data: Partial<PurchaseEntity>): Promise<PurchaseEntity> { return this.repo.save(this.repo.create(data)); }
  list(outletId?: string): Promise<PurchaseEntity[]> { return this.repo.find({ where: outletId ? { outletId } : {}, order: { createdAt: 'DESC' } }); }
}

