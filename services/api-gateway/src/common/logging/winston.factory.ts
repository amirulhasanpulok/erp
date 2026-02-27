import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const LOG_LEVELS = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'];

function resolveLogLevel(): string {
  const level = (process.env.LOG_LEVEL ?? 'info').toLowerCase();
  return LOG_LEVELS.includes(level) ? level : 'info';
}

export function createWinstonConfig(): winston.LoggerOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      level: resolveLogLevel(),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'api-gateway',
        environment: process.env.NODE_ENV ?? 'development'
      },
      transports: [new winston.transports.Console()]
    };
  }

  return {
    level: resolveLogLevel(),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.ms(),
      nestWinstonModuleUtilities.format.nestLike('API-GATEWAY', {
        prettyPrint: true,
        colors: true
      })
    ),
    transports: [new winston.transports.Console()]
  };
}
