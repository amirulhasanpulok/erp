import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, map } from 'rxjs';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        timestamp: new Date().toISOString(),
        path: request.originalUrl ?? request.url,
        requestId: request.headers['x-request-id'] ?? null,
        data
      }))
    );
  }
}
