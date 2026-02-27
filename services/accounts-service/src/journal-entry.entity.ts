import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
@Entity('journal_entries')
export class JournalEntryEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ name: 'outlet_id', type: 'uuid' }) outletId!: string;
  @Column({ name: 'reference_type', type: 'varchar', length: 50 }) referenceType!: string;
  @Column({ name: 'reference_id', type: 'uuid' }) referenceId!: string;
  @Column({ name: 'debit_account', type: 'varchar', length: 120 }) debitAccount!: string;
  @Column({ name: 'credit_account', type: 'varchar', length: 120 }) creditAccount!: string;
  @Column({ type: 'numeric', precision: 14, scale: 2 }) amount!: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt!: Date;
}

