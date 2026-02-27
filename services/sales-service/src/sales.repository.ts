import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleEntity } from './sale.entity';
@Injectable()
export class SalesRepository {
  constructor(@InjectRepository(SaleEntity) private readonly repo: Repository<SaleEntity>) {}
  create(data: Partial<SaleEntity>): Promise<SaleEntity> { return this.repo.save(this.repo.create(data)); }
  list(outletId?: string): Promise<SaleEntity[]> { return this.repo.find({ where: outletId ? { outletId } : {}, order: { createdAt: 'DESC' } }); }
}

