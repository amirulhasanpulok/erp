import { IsObject, IsOptional, IsString } from 'class-validator';

export class PublishTestEventDto {
  @IsString()
  eventType!: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsObject()
  data!: Record<string, unknown>;
}

