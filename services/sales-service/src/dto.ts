import { IsNumberString, IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateSaleDto {
  @IsUUID() outletId!: string;
  @IsUUID() productId!: string;
  @IsOptional()
  @IsUUID()
  branchId?: string;
  @IsOptional()
  @IsUUID()
  customerId?: string;
  @IsOptional()
  @IsString()
  status?: string;
  @IsNumberString() quantity!: string;
  @IsNumberString() total!: string;
  @IsString() paymentMethod!: string;
}
