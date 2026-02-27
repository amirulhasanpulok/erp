import { Injectable } from '@nestjs/common';
import { AuditRepository } from './audit.repository';

@Injectable()
export class AuditService {
  constructor(private readonly repository: AuditRepository) {}

  writeManual(body: Record<string, unknown>): Promise<{ status: string; id: string }> {
    return this.repository
      .create({
        outletId: (body.outletId as string | undefined) ?? null,
        actorId: (body.actorId as string | undefined) ?? null,
        source: 'api',
        eventType: String(body.eventType ?? 'MANUAL_AUDIT'),
        payload: body
      })
      .then((row) => ({ status: 'recorded', id: row.id }));
  }

  writeEventSnapshot(event: {
    source: string;
    eventType: string;
    data: Record<string, unknown>;
    outletId?: string | null;
  }): Promise<void> {
    return this.repository
      .create({
        outletId: event.outletId ?? null,
        actorId: null,
        source: event.source,
        eventType: event.eventType,
        payload: event.data
      })
      .then(() => undefined);
  }

  list(
    outletId?: string,
    eventType?: string,
    source?: string,
    limit = 100
  ) {
    return this.repository.list(outletId, eventType, source, limit);
  }
}
