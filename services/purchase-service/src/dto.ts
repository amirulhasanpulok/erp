import { IsNumberString, IsString, IsUUID } from 'class-validator';
export class ReceivePurchaseDto {
  @IsUUID() outletId!: string;
  @IsUUID() productId!: string;
  @IsNumberString() quantity!: string;
  @IsString() supplierName!: string;
  @IsNumberString() total!: string;
}
