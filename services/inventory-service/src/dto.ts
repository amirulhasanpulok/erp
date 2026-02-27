import { IsNumberString, IsUUID } from 'class-validator';
export class AdjustStockDto {
  @IsUUID() outletId!: string;
  @IsUUID() productId!: string;
  @IsNumberString() delta!: string;
}

