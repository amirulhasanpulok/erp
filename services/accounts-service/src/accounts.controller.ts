import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { PostJournalDto } from './dto';
import { JwtAccessGuard } from './jwt-access.guard';
import { AccountsService } from './accounts.service';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles('hq_admin', 'accountant')
@Controller({ path: 'accounts', version: '1' })
export class AccountsController {
  constructor(private readonly service: AccountsService) {}
  @Post('journals') post(@Body() dto: PostJournalDto) { return this.service.post(dto); }
  @Get('journals') list(@Query('outletId') outletId?: string) { return this.service.list(outletId); }
  @Get('trial-balance') trialBalance(@Query('outletId') outletId?: string) { return this.service.trialBalance(outletId); }
  @Get('ledger') ledger(@Query('account') account: string, @Query('outletId') outletId?: string) {
    return this.service.ledger(outletId, account);
  }
}
