import { config as dotenvConfig } from 'dotenv';
import { DataSource } from 'typeorm';
import { AuthCredentialEntity } from '../modules/auth/entities/auth-credential.entity';
import { RefreshTokenEntity } from '../modules/auth/entities/refresh-token.entity';

dotenvConfig();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true',
  synchronize: false,
  logging: false,
  entities: [AuthCredentialEntity, RefreshTokenEntity],
  migrations: [`${__dirname}/migrations/*{.ts,.js}`]
});

