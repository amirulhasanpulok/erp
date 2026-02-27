import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
export class CreateOutletDto {
  @IsString() @MinLength(2) name!: string;
  @IsOptional() @IsBoolean() hqVisible?: boolean;
}
export class UpdateOutletDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsBoolean() hqVisible?: boolean;
}

