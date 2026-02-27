import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CreateSaleDto } from './dto';
import { JwtAccessGuard } from './jwt-access.guard';
import { SalesService } from './sales.service';
@UseGuards(JwtAccessGuard)
@Controller({ path: 'sales', version: '1' })
export class SalesController {
  constructor(private readonly service: SalesService) {}
  @Post() create(@Body() dto: CreateSaleDto) { return this.service.create(dto); }
  @Get() list(@Query('outletId') outletId?: string) { return this.service.list(outletId); }
}
