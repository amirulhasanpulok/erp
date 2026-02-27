import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSalesIndexesAuditSoftDelete1700000002101 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sales
      ADD COLUMN IF NOT EXISTS branch_id uuid,
      ADD COLUMN IF NOT EXISTS customer_id uuid,
      ADD COLUMN IF NOT EXISTS status varchar(40) NOT NULL DEFAULT 'completed',
      ADD COLUMN IF NOT EXISTS created_by uuid,
      ADD COLUMN IF NOT EXISTS updated_by uuid,
      ADD COLUMN IF NOT EXISTS deleted_at timestamptz
    `);

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_sales_outlet_id ON sales(outlet_id)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_sales_branch_id ON sales(branch_id)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id)'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS idx_sales_customer_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_sales_branch_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_sales_status');
    await queryRunner.query('DROP INDEX IF EXISTS idx_sales_created_at');
    await queryRunner.query('DROP INDEX IF EXISTS idx_sales_product_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_sales_outlet_id');

    await queryRunner.query('ALTER TABLE sales DROP COLUMN IF EXISTS deleted_at');
    await queryRunner.query('ALTER TABLE sales DROP COLUMN IF EXISTS updated_by');
    await queryRunner.query('ALTER TABLE sales DROP COLUMN IF EXISTS created_by');
    await queryRunner.query('ALTER TABLE sales DROP COLUMN IF EXISTS status');
    await queryRunner.query('ALTER TABLE sales DROP COLUMN IF EXISTS customer_id');
    await queryRunner.query('ALTER TABLE sales DROP COLUMN IF EXISTS branch_id');
  }
}
