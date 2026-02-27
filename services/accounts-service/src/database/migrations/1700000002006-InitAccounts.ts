import { MigrationInterface, QueryRunner } from 'typeorm';
export class InitAccounts1700000002006 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id uuid NOT NULL,
        reference_type varchar(50) NOT NULL,
        reference_id uuid NOT NULL,
        debit_account varchar(120) NOT NULL,
        credit_account varchar(120) NOT NULL,
        amount numeric(14,2) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  }
  async down(queryRunner: QueryRunner): Promise<void> { await queryRunner.query('DROP TABLE IF EXISTS journal_entries'); }
}

