import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdjustStockDto } from './dto';
import { JwtAccessGuard } from './jwt-access.guard';
import { StockService } from './stock.service';
@UseGuards(JwtAccessGuard)
@Controller({ path: 'inventory', version: '1' })
export class StockController {
  constructor(private readonly service: StockService) {}
  @Post('adjust') adjust(@Body() dto: AdjustStockDto) { return this.service.adjust(dto); }
}
