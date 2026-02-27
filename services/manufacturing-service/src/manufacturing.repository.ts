import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManufacturingEntity } from './manufacturing.entity';
@Injectable()
export class ManufacturingRepository {
  constructor(@InjectRepository(ManufacturingEntity) private readonly repo: Repository<ManufacturingEntity>) {}
  create(data: Partial<ManufacturingEntity>): Promise<ManufacturingEntity> { return this.repo.save(this.repo.create(data)); }
  list(outletId?: string): Promise<ManufacturingEntity[]> { return this.repo.find({ where: outletId ? { outletId } : {}, order: { createdAt: 'DESC' } }); }
}

