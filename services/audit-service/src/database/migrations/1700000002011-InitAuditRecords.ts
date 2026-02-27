import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAuditRecords1700000002011 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_records (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id uuid,
        actor_id uuid,
        source varchar(80) NOT NULL,
        event_type varchar(120) NOT NULL,
        payload jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_audit_records_outlet_id ON audit_records(outlet_id)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_audit_records_event_type ON audit_records(event_type)'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS audit_records');
  }
}

