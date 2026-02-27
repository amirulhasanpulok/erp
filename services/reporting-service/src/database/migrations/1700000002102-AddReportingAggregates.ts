import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportingAggregates1700000002102 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS daily_sales (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id uuid NOT NULL,
        branch_id uuid,
        report_date date NOT NULL,
        order_count integer NOT NULL DEFAULT 0,
        total_amount numeric(18,2) NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE(outlet_id, report_date, branch_id)
      )
    `);

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_daily_sales_report_date ON daily_sales(report_date)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_daily_sales_outlet_id ON daily_sales(outlet_id)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_daily_sales_branch_id ON daily_sales(branch_id)'
    );

    await queryRunner.query('DROP MATERIALIZED VIEW IF EXISTS mv_reporting_kpis');
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW mv_reporting_kpis AS
      SELECT
        now()::date AS snapshot_date,
        m.outlet_id,
        SUM(CASE WHEN m.event_type = 'SALE_CREATED' THEN m.count ELSE 0 END) AS sales_events,
        SUM(CASE WHEN m.event_type = 'PAYMENT_CONFIRMED' THEN m.count ELSE 0 END) AS payment_events,
        SUM(CASE WHEN m.event_type = 'SHIPMENT_CREATED' THEN m.count ELSE 0 END) AS shipment_events,
        SUM(m.count) AS total_events
      FROM report_metrics m
      GROUP BY m.outlet_id
    `);

    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_reporting_kpis_outlet ON mv_reporting_kpis(outlet_id)'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_mv_reporting_kpis_outlet');
    await queryRunner.query('DROP MATERIALIZED VIEW IF EXISTS mv_reporting_kpis');
    await queryRunner.query('DROP INDEX IF EXISTS idx_daily_sales_branch_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_daily_sales_outlet_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_daily_sales_report_date');
    await queryRunner.query('DROP TABLE IF EXISTS daily_sales');
  }
}
