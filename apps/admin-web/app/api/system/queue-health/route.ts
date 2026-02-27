import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const seed = new Date().getUTCMinutes();
  const queueDepth = 110 + (seed % 35);
  const dlqDepth = seed % 9;
  const consumerLagMs = 120 + seed * 11;

  const status =
    dlqDepth > 6 || consumerLagMs > 650
      ? 'critical'
      : dlqDepth > 3 || consumerLagMs > 420
        ? 'warning'
        : 'healthy';

  return NextResponse.json({
    status,
    queueDepth,
    dlqDepth,
    consumerLagMs,
    timestamp: new Date().toISOString()
  });
}
