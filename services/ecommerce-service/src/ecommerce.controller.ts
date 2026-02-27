import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { PlaceOrderDto } from './dto';
import { JwtAccessGuard } from './jwt-access.guard';
import { EcommerceService } from './ecommerce.service';
@UseGuards(JwtAccessGuard)
@Controller({ path: 'ecommerce', version: '1' })
export class EcommerceController {
  constructor(private readonly service: EcommerceService) {}
  @Post('orders') place(@Body() dto: PlaceOrderDto) { return this.service.place(dto); }
  @Get('orders') list(@Query('outletId') outletId?: string) { return this.service.list(outletId); }
  @Get('orders/:id') tracking(@Param('id') id: string) { return this.service.tracking(id); }
}
