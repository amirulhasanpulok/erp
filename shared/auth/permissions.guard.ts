import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from './permissions.decorator';

type AuthPayload = { permissions?: string[] };

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { auth?: AuthPayload; user?: AuthPayload }>();
    const permissions = request.auth?.permissions ?? request.user?.permissions ?? [];
    if (permissions.length === 0) {
      return true;
    }

    for (const required of requiredPermissions) {
      if (!permissions.includes(required)) {
        throw new ForbiddenException(`Missing permission: ${required}`);
      }
    }

    return true;
  }
}
