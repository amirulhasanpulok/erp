import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EcommerceOrderEntity } from './order.entity';
@Injectable()
export class EcommerceRepository {
  constructor(@InjectRepository(EcommerceOrderEntity) private readonly repo: Repository<EcommerceOrderEntity>) {}
  create(data: Partial<EcommerceOrderEntity>): Promise<EcommerceOrderEntity> { return this.repo.save(this.repo.create(data)); }
  list(outletId?: string): Promise<EcommerceOrderEntity[]> { return this.repo.find({ where: outletId ? { outletId } : {}, order: { createdAt: 'DESC' } }); }
  findById(id: string): Promise<EcommerceOrderEntity | null> { return this.repo.findOne({ where: { id } }); }
  async updateStatus(id: string, status: string): Promise<void> { await this.repo.update({ id }, { status }); }
}
