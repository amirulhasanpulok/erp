import { IsNumberString, IsString, IsUUID } from 'class-validator';
export class CreateSaleDto {
  @IsUUID() outletId!: string;
  @IsUUID() productId!: string;
  @IsNumberString() quantity!: string;
  @IsNumberString() total!: string;
  @IsString() paymentMethod!: string;
}
