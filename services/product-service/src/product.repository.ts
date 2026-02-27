import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './product.entity';
@Injectable()
export class ProductRepository {
  constructor(@InjectRepository(ProductEntity) private readonly repo: Repository<ProductEntity>) {}
  create(data: Partial<ProductEntity>): Promise<ProductEntity> { return this.repo.save(this.repo.create(data)); }
  list(outletId?: string): Promise<ProductEntity[]> { return this.repo.find({ where: outletId ? { outletId } : {}, order: { createdAt: 'DESC' } }); }
  find(id: string): Promise<ProductEntity | null> { return this.repo.findOne({ where: { id } }); }
  save(e: ProductEntity): Promise<ProductEntity> { return this.repo.save(e); }
}

