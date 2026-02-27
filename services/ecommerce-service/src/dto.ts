import { IsNumberString, IsString, IsUUID } from 'class-validator';
export class PlaceOrderDto {
  @IsUUID() outletId!: string;
  @IsUUID() productId!: string;
  @IsNumberString() quantity!: string;
  @IsString() customerName!: string;
  @IsString() customerPhone!: string;
  @IsNumberString() total!: string;
}
