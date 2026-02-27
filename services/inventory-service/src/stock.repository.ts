import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockEntity } from './stock.entity';
@Injectable()
export class StockRepository {
  constructor(@InjectRepository(StockEntity) private readonly repo: Repository<StockEntity>) {}
  findByOutletProduct(outletId: string, productId: string): Promise<StockEntity | null> { return this.repo.findOne({ where: { outletId, productId } }); }
  save(e: StockEntity): Promise<StockEntity> { return this.repo.save(e); }
  create(data: Partial<StockEntity>): Promise<StockEntity> { return this.repo.save(this.repo.create(data)); }
}

