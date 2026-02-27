import { Controller, Get } from '@nestjs/common';
@Controller({ path: 'health', version: '1' })
export class HealthController {
  @Get() check(): { status: string; service: string } { return { status: 'ok', service: 'product-service' }; }
}

