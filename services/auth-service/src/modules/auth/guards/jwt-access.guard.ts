import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtAuthPayload } from '../types/jwt-auth-payload.type';

@Injectable()
export class JwtAccessGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { auth?: JwtAuthPayload }>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const token = authHeader.slice(7);
    try {
      const payload = this.jwtService.verify<JwtAuthPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET')
      });
      if (payload.tokenType !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }
      request.auth = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

