import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsUUID()
  outletId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ type: [String], example: ['cashier'] })
  @IsArray()
  @IsString({ each: true })
  roles!: string[];
}

