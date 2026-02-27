export interface EventEnvelope<TData = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  timestamp: string;
  source: string;
  version: '1.0';
  data: TData;
}

