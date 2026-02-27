import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

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
    const granted = request.auth?.permissions ?? request.user?.permissions ?? [];
    if (granted.length === 0) {
      // Let route-level JWT guard return 401 for unauthenticated requests.
      return true;
    }

    for (const required of requiredPermissions) {
      if (!granted.includes(required)) {
        throw new ForbiddenException(`Missing permission: ${required}`);
      }
    }

    return true;
  }
}
