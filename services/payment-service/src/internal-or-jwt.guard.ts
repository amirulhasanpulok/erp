import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class InternalOrJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const internalKey = request.headers['x-internal-key'];
    const expected = process.env.INTERNAL_SERVICE_KEY ?? '';
    if (typeof internalKey === 'string' && expected && internalKey === expected) {
      return true;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token or internal key');
    }
    const token = authHeader.slice(7);
    try {
      const payload = verify(token, process.env.JWT_ACCESS_SECRET ?? '');
      (request as Request & { auth?: unknown }).auth = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}

