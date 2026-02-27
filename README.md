# ERP Platform (Microservices)

Production-grade ERP platform for a single company with multiple outlets.

## Services

Core:
- api-gateway
- auth-service
- user-service
- outlet-service

Business:
- product-service
- inventory-service
- sales-service
- purchase-service
- accounts-service
- manufacturing-service
- ecommerce-service

Support:
- reporting-service
- notification-service
- audit-service
- logistics-service
- payment-service

## Infra
- PostgreSQL (database-per-service)
- RabbitMQ (`erp.events` topic exchange)
- Redis

## Current status
- Root structure scaffolded
- `api-gateway` scaffolded
- `auth-service` scaffolded
- `user-service` scaffolded
- Remaining microservices scaffolded with domain modules:
  - `outlet-service`
  - `product-service`
  - `inventory-service`
  - `sales-service`
  - `purchase-service`
  - `accounts-service`
  - `manufacturing-service`
  - `ecommerce-service`
  - `payment-service`
  - `logistics-service`
  - `notification-service`
  - `audit-service`
  - `reporting-service`
- Frontend apps scaffolded:
  - `apps/admin-web` (Next.js)
  - `apps/pos-pwa` (React + Vite)
  - `apps/ecommerce-web` (Next.js)
- Frontend API integration pass:
  - admin dashboard reads outlet/product/report summaries via API gateway
  - POS PWA submits sales checkout to `/api/v1/sales`
  - ecommerce web submits checkout to `/api/v1/ecommerce/orders`, supports redirect and `/api/v1/ecommerce/orders/:id` tracking
  - docker-compose passes frontend runtime API base envs to point browser apps at `http://localhost:3000`
- Full `docker-compose.yml` wired for services + per-service databases + RabbitMQ + Redis
  - compose now centralizes cross-service `JWT_ACCESS_SECRET` and `INTERNAL_SERVICE_KEY` to prevent secret drift

## Operations
- Runbook: `docs/runbook.md`
- Bulk dependency install script: `scripts/install-all.ps1`
- Bulk migration script: `scripts/run-migrations.ps1`
- Hardening pass:
  - transactional outbox + RabbitMQ publisher wired in `sales`, `purchase`, `manufacturing`, `payment`, `logistics`
  - RabbitMQ consumers + Redis idempotency + DLQ queue configuration wired in:
    - `sales-service`
    - `purchase-service`
    - `manufacturing-service`
    - `payment-service`
    - `logistics-service`
    - `notification-service`
    - `reporting-service`
    - `audit-service`
    - `ecommerce-service`
    - `accounts-service`
  - canonical event contract documentation added at `docs/event-flow.md`
- Business-rule automation pass:
  - `sales-service`, `purchase-service`, and `ecommerce-service` payloads include `productId` + `quantity`
  - `inventory-service` auto-consumes `SALE_CREATED`, `PURCHASE_RECEIVED`, `MANUFACTURE_COMPLETED` to update stock
  - `ecommerce-service` publishes `ECOM_ORDER_PLACED` via outbox and consumes payment/delivery events for order state
  - `accounts-service` auto-posts journals from sale/purchase/manufacture events
  - `logistics-service` auto-creates shipment on `PAYMENT_CONFIRMED`
  - `ecommerce-service` returns payment redirect URL via synchronous `payment-service` initiation call
  - `logistics-service` includes Pathao/Steadfast adapter calls with fallback tracking generation
  - `inventory-service` emits canonical `STOCK_UPDATED` for both API-driven and event-driven stock mutations
  - `accounts-service` exposes `trial-balance` and `ledger` APIs for journal verification
  - `ecommerce-service` exposes order tracking endpoint (`/api/v1/ecommerce/orders/:id`)
  - `logistics-service` exposes shipment tracking endpoint and provider-aware cancel flow
  - outbox relayer workers added to republish pending events periodically for broker-recovery scenarios
  - `notification-service` exposes authenticated notification status query (`/api/v1/notifications`)
- Runtime normalization pass:
  - strict request validation (`forbidNonWhitelisted`) across newly scaffolded services
  - `x-request-id` propagation added in service bootstraps for tracing consistency
  - API gateway proxy forwards `x-request-id` and returns structured `502` on upstream failures
  - API gateway optional edge rate limiting (`RATE_LIMIT_*`) with `429` responses
  - API gateway configurable CORS (`CORS_ENABLED`, `CORS_ORIGINS`) for admin/POS/ecommerce browser clients
  - global exception filter + logging interceptor standardized across remaining services
  - local JWT access guards enforced on business controllers; public payment/logistics callback webhooks remain unauthenticated for gateway/provider callbacks
  - secure internal service auth path added for ecommerce->payment initiation via `x-internal-key`
  - RBAC enforcement added for sensitive endpoints:
    - `accounts-service` (`hq_admin`, `accountant`)
    - `reporting-service` (`hq_admin`, `accountant`, `manager`)
    - `audit-service` (`hq_admin`, `auditor`)
    - `notification-service` (`hq_admin`, `manager`, `support`)
- compile-safety consistency: `JWT_ACCESS_SECRET` env and `@types/jsonwebtoken` aligned for all JWT-protected services
- migration-operability consistency:
  - `migration:run` scripts standardized across DB-backed services
  - `src/database/typeorm.config.ts` added for migration execution targets
  - `reporting-service` now includes DB-backed event read model (`report_metrics`) and live aggregated report APIs
  - `audit-service` now persists immutable API/event audit records in PostgreSQL (`audit_records`)
  - `notification-service` now persists notification jobs/status (`notifications`) with retry-ready attempt tracking
  - `audit-service` now exposes filtered audit query API (`/api/v1/audits`)
