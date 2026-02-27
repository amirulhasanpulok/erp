import { plainToInstance } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: string = 'development';

  @IsInt()
  @Min(1)
  PORT: number = 3000;

  @IsString()
  API_PREFIX: string = 'api';

  @IsString()
  API_VERSION: string = 'v1';

  @IsString()
  JWT_ACCESS_SECRET!: string;

  @IsString()
  RABBITMQ_URL!: string;

  @IsString()
  RABBITMQ_EXCHANGE: string = 'erp.events';

  @IsString()
  RABBITMQ_QUEUE: string = 'api-gateway.events.q';

  @IsOptional()
  @IsString()
  RABBITMQ_DLX?: string;

  @IsString()
  RABBITMQ_DLK: string = 'api-gateway.events.dlq';

  @IsString()
  REDIS_URL!: string;

  @IsInt()
  @Min(60)
  EVENT_IDEMPOTENCY_TTL_SECONDS: number = 86400;

  @IsInt()
  @Min(1)
  EVENT_DLQ_MAX_RETRIES: number = 3;

  @IsString()
  AUTH_SERVICE_URL!: string;

  @IsString()
  USER_SERVICE_URL!: string;

  @IsString()
  OUTLET_SERVICE_URL!: string;

  @IsString()
  PRODUCT_SERVICE_URL!: string;

  @IsString()
  INVENTORY_SERVICE_URL!: string;

  @IsString()
  SALES_SERVICE_URL!: string;

  @IsString()
  PURCHASE_SERVICE_URL!: string;

  @IsString()
  ACCOUNTS_SERVICE_URL!: string;

  @IsString()
  MANUFACTURING_SERVICE_URL!: string;

  @IsString()
  ECOMMERCE_SERVICE_URL!: string;

  @IsString()
  REPORTING_SERVICE_URL!: string;

  @IsString()
  NOTIFICATION_SERVICE_URL!: string;

  @IsString()
  AUDIT_SERVICE_URL!: string;

  @IsString()
  LOGISTICS_SERVICE_URL!: string;

  @IsString()
  PAYMENT_SERVICE_URL!: string;

  @IsBoolean()
  RATE_LIMIT_ENABLED: boolean = true;

  @IsInt()
  @Min(1000)
  RATE_LIMIT_WINDOW_MS: number = 60000;

  @IsInt()
  @Min(1)
  RATE_LIMIT_MAX: number = 300;

  @IsBoolean()
  CORS_ENABLED: boolean = true;

  @IsString()
  CORS_ORIGINS: string = 'http://localhost:3100,http://localhost:3200,http://localhost:3300';

  @IsBoolean()
  HELMET_ENABLED: boolean = true;

  @IsBoolean()
  TRUST_PROXY: boolean = true;

  @IsString()
  INTERNAL_IP_WHITELIST: string = '127.0.0.1,::1';

  @IsBoolean()
  INTERNAL_IP_WHITELIST_ENABLED: boolean = true;

  @IsBoolean()
  OTEL_ENABLED: boolean = false;

  @IsString()
  LOG_LEVEL: string = 'info';
}

export function validate(config: Record<string, unknown>): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true
  });

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
