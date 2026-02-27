import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportingAuditColumns1700000002104 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE report_metrics
      ADD COLUMN IF NOT EXISTS created_by uuid,
      ADD COLUMN IF NOT EXISTS updated_by uuid,
      ADD COLUMN IF NOT EXISTS deleted_at timestamptz
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE report_metrics DROP COLUMN IF EXISTS deleted_at');
    await queryRunner.query('ALTER TABLE report_metrics DROP COLUMN IF EXISTS updated_by');
    await queryRunner.query('ALTER TABLE report_metrics DROP COLUMN IF EXISTS created_by');
  }
}
