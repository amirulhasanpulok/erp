import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { AppModule } from './app.module';
import { GlobalHttpExceptionFilter } from './common/http-exception.filter';
import { LoggingInterceptor } from './common/logging.interceptor';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use((req: { headers: Record<string, string> }, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
    const requestId = req.headers['x-request-id'] ?? randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  const doc = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Reporting Service').setVersion('1.0').build());
  SwaggerModule.setup('api/docs', app, doc);
  await app.listen(Number(process.env.PORT ?? 3011));
}
void bootstrap();
