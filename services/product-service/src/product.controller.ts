import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtAccessGuard } from './jwt-access.guard';
import { ProductService } from './product.service';
@UseGuards(JwtAccessGuard)
@Controller({ path: 'products', version: '1' })
export class ProductController {
  constructor(private readonly service: ProductService) {}
  @Post() create(@Body() dto: CreateProductDto) { return this.service.create(dto); }
  @Get() list(@Query('outletId') outletId?: string) { return this.service.list(outletId); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateProductDto) { return this.service.update(id, dto); }
}
