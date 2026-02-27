import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportingMetricIndexes1700000002103 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_report_metrics_created_at ON report_metrics(created_at)'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_report_metrics_created_at');
  }
}
