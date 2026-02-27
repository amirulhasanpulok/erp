import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUserTables1700000001000 implements MigrationInterface {
  name = 'InitUserTables1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id uuid NOT NULL,
        full_name varchar(150) NOT NULL,
        email varchar(255) NOT NULL UNIQUE,
        phone varchar(30),
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id uuid NOT NULL,
        user_id uuid NOT NULL,
        role varchar(50) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles (user_id)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_user_roles_outlet_id ON user_roles (outlet_id)'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS user_roles');
    await queryRunner.query('DROP TABLE IF EXISTS users');
  }
}

