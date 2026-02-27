import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateShipmentDto, DeliveryWebhookDto } from './dto';
import { JwtAccessGuard } from './jwt-access.guard';
import { LogisticsService } from './logistics.service';
@Controller({ path: 'logistics', version: '1' })
export class LogisticsController {
  constructor(private readonly service: LogisticsService) {}
  @UseGuards(JwtAccessGuard)
  @Post('shipments')
  create(@Body() dto: CreateShipmentDto) { return this.service.create(dto); }
  @UseGuards(JwtAccessGuard)
  @Patch('shipments/:orderId/cancel')
  cancel(@Param('orderId') orderId: string) { return this.service.cancel(orderId); }
  @UseGuards(JwtAccessGuard)
  @Get('shipments/tracking/:trackingId')
  tracking(@Param('trackingId') trackingId: string) { return this.service.tracking(trackingId); }
  @Post('webhooks/delivery') webhook(@Body() dto: DeliveryWebhookDto) { return this.service.webhook(dto); }
}
