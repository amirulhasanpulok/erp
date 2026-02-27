import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import helmet from 'helmet';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ApiResponseInterceptor } from './common/interceptors/response.interceptor';
import { createWinstonConfig } from './common/logging/winston.factory';
import {
  bootstrapOpenTelemetry,
  shutdownOpenTelemetry
} from './common/observability/otel.bootstrap';
import { registerServiceProxies } from './gateway/proxy.bootstrap';

async function bootstrap(): Promise<void> {
  await bootstrapOpenTelemetry();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createWinstonConfig())
  });
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  if ((process.env.HELMET_ENABLED ?? 'true') === 'true') {
    app.use(
      helmet({
        crossOriginEmbedderPolicy: false
      })
    );
  }

  if ((process.env.CORS_ENABLED ?? 'true') === 'true') {
    const origins = (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (origins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin not allowed by CORS'));
      },
      credentials: true
    });
  }
  app.use((req: Request, res: Response, next: () => void) => {
    const requestId = req.headers['x-request-id'] ?? randomUUID();
    req.headers['x-request-id'] = String(requestId);
    res.setHeader('x-request-id', requestId);
    next();
  });

  const expressApp = app.getHttpAdapter().getInstance() as {
    set: (key: string, value: unknown) => void;
    get: (path: string, handler: (req: Request, res: Response) => void) => void;
  };
  if ((process.env.TRUST_PROXY ?? 'true') === 'true') {
    expressApp.set('trust proxy', 1);
  }
  expressApp.get('/health', (_req, res) => {
    res
      .status(200)
      .json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ERP API Gateway')
    .setDescription('API Gateway for ERP microservices')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);
  registerServiceProxies(app);

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  logger.log(`API Gateway running on port ${port}`);

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, () => {
      void shutdownOpenTelemetry();
    });
  }
}

void bootstrap();
