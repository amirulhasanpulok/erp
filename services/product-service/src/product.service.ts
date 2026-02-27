import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ProductRepository } from './product.repository';
@Injectable()
export class ProductService {
  constructor(private readonly repo: ProductRepository) {}
  create(dto: CreateProductDto) { return this.repo.create({ ...dto, active: true }); }
  list(outletId?: string) { return this.repo.list(outletId); }
  async update(id: string, dto: UpdateProductDto) {
    const e = await this.repo.find(id);
    if (!e) throw new NotFoundException('Product not found');
    if (dto.name !== undefined) e.name = dto.name;
    if (dto.active !== undefined) e.active = dto.active;
    return this.repo.save(e);
  }
}

