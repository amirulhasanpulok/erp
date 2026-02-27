import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OutletEntity } from './outlet.entity';
@Injectable()
export class OutletRepository {
  constructor(@InjectRepository(OutletEntity) private readonly repo: Repository<OutletEntity>) {}
  create(data: Partial<OutletEntity>): Promise<OutletEntity> { return this.repo.save(this.repo.create(data)); }
  list(): Promise<OutletEntity[]> { return this.repo.find({ order: { createdAt: 'DESC' } }); }
  find(id: string): Promise<OutletEntity | null> { return this.repo.findOne({ where: { id } }); }
  save(entity: OutletEntity): Promise<OutletEntity> { return this.repo.save(entity); }
}

