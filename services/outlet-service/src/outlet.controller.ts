import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateOutletDto, UpdateOutletDto } from './dto';
import { JwtAccessGuard } from './jwt-access.guard';
import { OutletService } from './outlet.service';
@UseGuards(JwtAccessGuard)
@Controller({ path: 'outlets', version: '1' })
export class OutletController {
  constructor(private readonly service: OutletService) {}
  @Post() create(@Body() dto: CreateOutletDto) { return this.service.create(dto); }
  @Get() list() { return this.service.list(); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateOutletDto) { return this.service.update(id, dto); }
}
