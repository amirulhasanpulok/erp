import {
  Injectable,
  Logger,
  NestMiddleware
} from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class InternalIpWhitelistMiddleware implements NestMiddleware {
  private readonly logger = new Logger(InternalIpWhitelistMiddleware.name);

  private readonly enabled =
    String(process.env.INTERNAL_IP_WHITELIST_ENABLED ?? 'true').toLowerCase() === 'true';

  private readonly whitelist = new Set(
    String(process.env.INTERNAL_IP_WHITELIST ?? '127.0.0.1,::1')
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean)
  );

  use(req: Request, res: Response, next: () => void): void {
    if (!this.enabled) {
      next();
      return;
    }

    const sourceIp = this.resolveIp(req);
    if (this.whitelist.has(sourceIp)) {
      next();
      return;
    }

    this.logger.warn(`Internal route blocked for IP: ${sourceIp}`);
    res.status(403).json({
      statusCode: 403,
      message: 'Source IP is not whitelisted'
    });
  }

  private resolveIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (Array.isArray(forwarded) && forwarded.length > 0) {
      return forwarded[0].split(',')[0].trim();
    }
    if (typeof forwarded === 'string' && forwarded.length > 0) {
      return forwarded.split(',')[0].trim();
    }
    return (req.ip || 'unknown').replace('::ffff:', '');
  }
}
