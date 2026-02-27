import { Logger } from '@nestjs/common';

const logger = new Logger('OpenTelemetry');

let sdkInstance: { start: () => Promise<void> | void; shutdown: () => Promise<void> | void } | null =
  null;

export async function bootstrapOpenTelemetry(): Promise<void> {
  const enabled = String(process.env.OTEL_ENABLED ?? 'false').toLowerCase() === 'true';
  if (!enabled) {
    return;
  }

  try {
    // Optional dependency scaffold: does not fail startup when packages are absent.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NodeSDK } = require('@opentelemetry/sdk-node');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

    const sdk = new NodeSDK({
      serviceName: 'api-gateway',
      instrumentations: [getNodeAutoInstrumentations()]
    });

    await sdk.start();
    sdkInstance = sdk;
    logger.log('OpenTelemetry initialized');
  } catch (error) {
    logger.warn(
      `OpenTelemetry enabled but optional packages are missing or invalid: ${(error as Error).message}`
    );
  }
}

export async function shutdownOpenTelemetry(): Promise<void> {
  if (!sdkInstance) {
    return;
  }

  try {
    await sdkInstance.shutdown();
    logger.log('OpenTelemetry shutdown complete');
  } catch (error) {
    logger.warn(`OpenTelemetry shutdown error: ${(error as Error).message}`);
  }
}
