import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOutletDto, UpdateOutletDto } from './dto';
import { OutletRepository } from './outlet.repository';
@Injectable()
export class OutletService {
  constructor(private readonly repo: OutletRepository) {}
  create(dto: CreateOutletDto) { return this.repo.create({ name: dto.name, hqVisible: dto.hqVisible ?? true, status: 'active' }); }
  list() { return this.repo.list(); }
  async update(id: string, dto: UpdateOutletDto) {
    const e = await this.repo.find(id);
    if (!e) throw new NotFoundException('Outlet not found');
    if (dto.name !== undefined) e.name = dto.name;
    if (dto.status !== undefined) e.status = dto.status;
    if (dto.hqVisible !== undefined) e.hqVisible = dto.hqVisible;
    return this.repo.save(e);
  }
}

