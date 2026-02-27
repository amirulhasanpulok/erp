import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitNotifications1700000002012 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id uuid,
        event_id varchar(120) NOT NULL,
        event_type varchar(120) NOT NULL,
        channel varchar(30) NOT NULL DEFAULT 'email',
        status varchar(30) NOT NULL DEFAULT 'queued',
        attempt_count integer NOT NULL DEFAULT 0,
        payload jsonb NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_notifications_event_id ON notifications(event_id)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status)'
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS notifications');
  }
}

