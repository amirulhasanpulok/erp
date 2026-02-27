import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ReceivePurchaseDto } from './dto';
import { JwtAccessGuard } from './jwt-access.guard';
import { PurchaseService } from './purchase.service';
@UseGuards(JwtAccessGuard)
@Controller({ path: 'purchases', version: '1' })
export class PurchaseController {
  constructor(private readonly service: PurchaseService) {}
  @Post('receive') receive(@Body() dto: ReceivePurchaseDto) { return this.service.receive(dto); }
  @Get() list(@Query('outletId') outletId?: string) { return this.service.list(outletId); }
}
