import { Injectable } from '@nestjs/common';
import { PostJournalDto } from './dto';
import { AccountsRepository } from './accounts.repository';
@Injectable()
export class AccountsService {
  constructor(private readonly repo: AccountsRepository) {}
  post(dto: PostJournalDto) { return this.repo.create(dto); }
  list(outletId?: string) { return this.repo.list(outletId); }
  trialBalance(outletId?: string) { return this.repo.trialBalance(outletId); }
  ledger(outletId: string | undefined, account: string) { return this.repo.ledger(outletId, account); }
}
