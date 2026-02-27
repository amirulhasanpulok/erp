'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';

type QueueHealthResponse = {
  status: 'healthy' | 'warning' | 'critical';
  queueDepth: number;
  dlqDepth: number;
  consumerLagMs: number;
  timestamp: string;
};

async function fetchQueueHealth(): Promise<QueueHealthResponse> {
  const response = await fetch('/api/system/queue-health', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Queue health request failed');
  }
  return response.json() as Promise<QueueHealthResponse>;
}

export function QueueHealthCard(): JSX.Element {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['queue-health'],
    queryFn: fetchQueueHealth,
    refetchInterval: 15_000
  });

  return (
    <Card className="h-full">
      <CardTitle>Event Queue Health</CardTitle>
      <CardDescription>RabbitMQ + DLQ + consumer lag (live cache via React Query)</CardDescription>

      {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading queue telemetry...</p>}
      {isError && <p className="mt-4 text-sm text-danger">Unable to load queue telemetry.</p>}
      {data && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className="font-semibold capitalize">{data.status}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Queue Depth</p>
            <p className="font-semibold">{data.queueDepth}</p>
          </div>
          <div>
            <p className="text-muted-foreground">DLQ Depth</p>
            <p className="font-semibold">{data.dlqDepth}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Consumer Lag</p>
            <p className="font-semibold">{data.consumerLagMs} ms</p>
          </div>
        </div>
      )}
    </Card>
  );
}
