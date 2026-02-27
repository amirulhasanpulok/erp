import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAuthTables1700000000000 implements MigrationInterface {
  name = 'InitAuthTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS auth_credentials (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL UNIQUE,
        outlet_id uuid NOT NULL,
        email varchar(255) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        role varchar(50) NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id uuid NOT NULL,
        credential_id uuid NOT NULL,
        token_hash varchar(255) NOT NULL,
        revoked boolean NOT NULL DEFAULT false,
        expires_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_refresh_tokens_credential_id ON refresh_tokens (credential_id)'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_refresh_tokens_outlet_id ON refresh_tokens (outlet_id)'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS refresh_tokens');
    await queryRunner.query('DROP TABLE IF EXISTS auth_credentials');
  }
}

