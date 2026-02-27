import { IsNumberString, IsString, IsUUID } from 'class-validator';
export class PostJournalDto {
  @IsUUID() outletId!: string;
  @IsString() referenceType!: string;
  @IsUUID() referenceId!: string;
  @IsString() debitAccount!: string;
  @IsString() creditAccount!: string;
  @IsNumberString() amount!: string;
}

