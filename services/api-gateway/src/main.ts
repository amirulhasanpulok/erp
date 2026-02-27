import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { registerServiceProxies } from './gateway/proxy.bootstrap';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
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
  if ((process.env.CORS_ENABLED ?? 'true') === 'true') {
    const origins = (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    app.enableCors({
      origin: origins.length > 0 ? origins : true,
      credentials: true
    });
  }
  app.use((req: { headers: Record<string, string>; }, res: { setHeader: (k: string, v: string) => void; }, next: () => void) => {
    const requestId = req.headers['x-request-id'] ?? randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    next();
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
}

void bootstrap();
