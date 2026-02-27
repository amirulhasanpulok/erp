import { IsNumberString, IsString, IsUUID } from 'class-validator';
export class InitiatePaymentDto {
  @IsUUID() outletId!: string;
  @IsUUID() orderId!: string;
  @IsNumberString() amount!: string;
  @IsString() customerName!: string;
  @IsString() customerPhone!: string;
}

