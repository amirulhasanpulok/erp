import { IsNumberString, IsUUID } from 'class-validator';
export class CompleteManufactureDto {
  @IsUUID() outletId!: string;
  @IsUUID() productId!: string;
  @IsNumberString() quantity!: string;
}

