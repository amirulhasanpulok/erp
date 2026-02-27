import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntryEntity } from './journal-entry.entity';
@Injectable()
export class AccountsRepository {
  constructor(@InjectRepository(JournalEntryEntity) private readonly repo: Repository<JournalEntryEntity>) {}
  create(data: Partial<JournalEntryEntity>): Promise<JournalEntryEntity> { return this.repo.save(this.repo.create(data)); }
  list(outletId?: string): Promise<JournalEntryEntity[]> { return this.repo.find({ where: outletId ? { outletId } : {}, order: { createdAt: 'DESC' } }); }
  async trialBalance(outletId?: string): Promise<Array<{ account: string; debit: string; credit: string }>> {
    const rows = await this.list(outletId);
    const debitMap = new Map<string, number>();
    const creditMap = new Map<string, number>();
    for (const row of rows) {
      const amount = Number(row.amount);
      debitMap.set(row.debitAccount, (debitMap.get(row.debitAccount) ?? 0) + amount);
      creditMap.set(row.creditAccount, (creditMap.get(row.creditAccount) ?? 0) + amount);
    }
    const accounts = new Set<string>([...debitMap.keys(), ...creditMap.keys()]);
    return [...accounts].map((account) => ({
      account,
      debit: (debitMap.get(account) ?? 0).toFixed(2),
      credit: (creditMap.get(account) ?? 0).toFixed(2)
    }));
  }
  async ledger(outletId: string | undefined, account: string): Promise<JournalEntryEntity[]> {
    return this.repo.find({
      where: [
        ...(outletId ? [{ outletId, debitAccount: account }, { outletId, creditAccount: account }] : [{ debitAccount: account }, { creditAccount: account }])
      ],
      order: { createdAt: 'DESC' }
    });
  }
}
