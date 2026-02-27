import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

type Bucket = { count: number; resetAt: number };

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly buckets = new Map<string, Bucket>();
  private readonly windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000);
  private readonly max = Number(process.env.RATE_LIMIT_MAX ?? 300);
  private readonly enabled = String(process.env.RATE_LIMIT_ENABLED ?? 'true') === 'true';

  use(req: Request, res: Response, next: () => void): void {
    if (!this.enabled) {
      next();
      return;
    }

    const key = this.resolveClientKey(req);
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || now >= existing.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      next();
      return;
    }

    existing.count += 1;
    this.buckets.set(key, existing);
    if (existing.count > this.max) {
      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests',
        retryAfterMs: existing.resetAt - now
      });
      return;
    }

    next();
  }

  private resolveClientKey(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (Array.isArray(forwarded) && forwarded.length > 0) return forwarded[0];
    if (typeof forwarded === 'string' && forwarded.length > 0) return forwarded.split(',')[0].trim();
    return req.ip || 'unknown';
  }
}

