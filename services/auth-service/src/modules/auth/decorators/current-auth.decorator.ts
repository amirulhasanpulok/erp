import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthPayload } from '../types/jwt-auth-payload.type';

export const CurrentAuth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtAuthPayload => {
    const request = ctx.switchToHttp().getRequest<Request & { auth: JwtAuthPayload }>();
    return request.auth;
  }
);

