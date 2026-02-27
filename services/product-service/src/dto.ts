import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
export class CreateProductDto {
  @IsUUID() outletId!: string;
  @IsString() sku!: string;
  @IsString() barcode!: string;
  @IsString() name!: string;
}
export class UpdateProductDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

