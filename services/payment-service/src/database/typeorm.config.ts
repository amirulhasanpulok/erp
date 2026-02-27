import { config as dotenvConfig } from 'dotenv';
import { DataSource } from 'typeorm';
import { OutboxEventEntity } from '../outbox.entity';
import { PaymentEntity } from '../payment.entity';

dotenvConfig();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [PaymentEntity, OutboxEventEntity],
  migrations: ['src/database/migrations/*.ts']
});

