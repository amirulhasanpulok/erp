import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ListUsersDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  outletId?: string;
}

