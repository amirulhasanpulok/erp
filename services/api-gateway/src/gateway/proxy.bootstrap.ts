import { INestApplication, Logger } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';

type RouteProxy = {
  routePrefix: string;
  target: string;
};

export function registerServiceProxies(app: INestApplication): void {
  const logger = new Logger('ProxyBootstrap');
  const expressApp = app.getHttpAdapter().getInstance();

  const proxies: RouteProxy[] = [
    { routePrefix: '/api/v1/auth', target: process.env.AUTH_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/users', target: process.env.USER_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/outlets', target: process.env.OUTLET_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/products', target: process.env.PRODUCT_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/inventory', target: process.env.INVENTORY_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/sales', target: process.env.SALES_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/purchases', target: process.env.PURCHASE_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/accounts', target: process.env.ACCOUNTS_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/manufacturing', target: process.env.MANUFACTURING_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/ecommerce', target: process.env.ECOMMERCE_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/reports', target: process.env.REPORTING_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/notifications', target: process.env.NOTIFICATION_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/audits', target: process.env.AUDIT_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/logistics', target: process.env.LOGISTICS_SERVICE_URL ?? '' },
    { routePrefix: '/api/v1/payments', target: process.env.PAYMENT_SERVICE_URL ?? '' }
  ];

  for (const proxy of proxies) {
    if (!proxy.target) {
      continue;
    }

    expressApp.use(
      proxy.routePrefix,
      createProxyMiddleware({
        target: proxy.target,
        changeOrigin: true,
        proxyTimeout: 30000,
        timeout: 30000,
        onProxyReq: (proxyReq: any, req: { headers: Record<string, string | string[] | undefined> }) => {
          const requestId = req.headers['x-request-id'];
          if (typeof requestId === 'string' && requestId) {
            proxyReq.setHeader('x-request-id', requestId);
          }
        },
        onError: (
          error: any,
          req: any,
          res: { writeHead: (s: number, h: Record<string, string>) => void; end: (b: string) => void }
        ) => {
          logger.error(`Proxy failure for ${proxy.routePrefix}: ${error.message}`);
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              statusCode: 502,
              message: 'Bad gateway',
              route: proxy.routePrefix
            })
          );
        }
      } as any)
    );
    logger.log(`Proxy mapped: ${proxy.routePrefix} -> ${proxy.target}`);
  }
}
