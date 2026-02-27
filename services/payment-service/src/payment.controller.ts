import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { InitiatePaymentDto } from './dto';
import { InternalOrJwtGuard } from './internal-or-jwt.guard';
import { PaymentService } from './payment.service';
@Controller({ path: 'payments', version: '1' })
export class PaymentController {
  constructor(private readonly service: PaymentService) {}
  @UseGuards(InternalOrJwtGuard)
  @Post('initiate')
  initiate(@Body() dto: InitiatePaymentDto) { return this.service.initiate(dto); }
  @Get('success') success(@Query('orderId') orderId: string) { return this.service.success(orderId); }
  @Get('fail') fail(): { status: string } { return { status: 'failed' }; }
  @Get('cancel') cancel(): { status: string } { return { status: 'cancelled' }; }
  @Post('ipn')
  ipn(@Body() body: Record<string, unknown>): { status: string; verified: boolean } {
    const verification = this.service.verifyIpnSignature(body);
    return { status: verification.valid ? 'verified' : 'invalid', verified: verification.valid };
  }
}
