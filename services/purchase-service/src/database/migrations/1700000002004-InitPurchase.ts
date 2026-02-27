import { MigrationInterface, QueryRunner } from 'typeorm';
export class InitPurchase1700000002004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS purchase_receipts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id uuid NOT NULL,
        product_id uuid NOT NULL,
        quantity numeric(14,2) NOT NULL,
        supplier_name varchar(150) NOT NULL,
        total numeric(14,2) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS outbox_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id uuid NOT NULL,
        event_type varchar(80) NOT NULL,
        payload jsonb NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'pending',
        published_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS outbox_events');
    await queryRunner.query('DROP TABLE IF EXISTS purchase_receipts');
  }
}
