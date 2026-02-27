import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CompleteManufactureDto } from './dto';
import { JwtAccessGuard } from './jwt-access.guard';
import { ManufacturingService } from './manufacturing.service';
@UseGuards(JwtAccessGuard)
@Controller({ path: 'manufacturing', version: '1' })
export class ManufacturingController {
  constructor(private readonly service: ManufacturingService) {}
  @Post('complete') complete(@Body() dto: CompleteManufactureDto) { return this.service.complete(dto); }
  @Get() list(@Query('outletId') outletId?: string) { return this.service.list(outletId); }
}
