import { plainToInstance } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsString, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string = 'development';

  @IsInt()
  @Min(1)
  PORT: number = 3001;

  @IsString()
  API_PREFIX: string = 'api';

  @IsString()
  API_VERSION: string = 'v1';

  @IsString()
  DB_HOST!: string;

  @IsInt()
  @Min(1)
  DB_PORT: number = 5432;

  @IsString()
  DB_NAME!: string;

  @IsString()
  DB_USER!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsBoolean()
  DB_SSL: boolean = false;

  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_ACCESS_EXPIRES_IN: string = '15m';

  @IsString()
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_REFRESH_EXPIRES_IN: string = '7d';

  @IsString()
  RABBITMQ_URL!: string;

  @IsString()
  RABBITMQ_EXCHANGE: string = 'erp.events';

  @IsString()
  RABBITMQ_QUEUE: string = 'auth-service.events.q';

  @IsString()
  RABBITMQ_DLK: string = 'auth-service.events.dlq';

  @IsString()
  REDIS_URL!: string;

  @IsInt()
  @Min(60)
  EVENT_IDEMPOTENCY_TTL_SECONDS: number = 86400;

  @IsInt()
  @Min(4)
  BCRYPT_SALT_ROUNDS: number = 10;
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true
  });
  const errors = validateSync(validated, { skipMissingProperties: false });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validated;
}

