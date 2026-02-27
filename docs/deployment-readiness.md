# Deployment Readiness (Frontend + Backend + DB)

This file is the final pre-go-live gate for the ERP platform.

## 1) Environment and secrets
- Copy `ops/env/.env.prod.example` to `ops/env/.env.prod`.
- Set strong values for:
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `INTERNAL_SERVICE_KEY`
  - `REDIS_PASSWORD`
  - `RABBITMQ_DEFAULT_PASS`
- Configure live provider credentials:
  - SSLCommerz
  - Pathao
  - Steadfast
  - SMTP/SMS

## 2) Database readiness
- Ensure each service database exists (database-per-service).
- Run migrations for all services:
  - `powershell -ExecutionPolicy Bypass -File scripts/migrate-all.ps1`
- Enable scheduled backups:
  - `powershell -ExecutionPolicy Bypass -File scripts/db-backup.ps1 -OutputDir .\backups`
- Test restore in staging:
  - `powershell -ExecutionPolicy Bypass -File scripts/db-restore.ps1 -BackupDir .\backups`

## 3) Message broker readiness
- RabbitMQ exchange `erp.events` must exist as `topic`.
- Ensure each consumer has:
  - idempotency keying by `eventId`
  - DLQ binding
  - replay procedure documented

## 4) API and edge readiness
- Deploy production stack:
  - `docker compose -f ops/deploy/docker-compose.prod.yml --env-file ops/env/.env.prod up -d --build`
- Validate reverse proxy routing:
  - `/api/*` to API gateway
  - `/admin/*` to Admin frontend
  - `/pos/*` to POS frontend
  - `/` to Ecommerce frontend
- Confirm gateway hardening:
  - request id propagation
  - CORS configured
  - rate limit enabled

## 5) Frontend readiness
- Admin frontend:
  - dashboard widgets load from gateway APIs
  - outlet/product/inventory/purchase/manufacturing/accounting/report pages authenticated
- POS frontend:
  - outlet login
  - barcode/cart/checkout path
  - daily closing report
- Ecommerce frontend:
  - product list/detail/cart/checkout
  - SSLCommerz redirect flow
  - order tracking

## 6) Required acceptance tests
- Run contract tests:
  - `cd tests/contracts && npm install && npm test`
- Execute E2E checklist:
  - `tests/e2e/erp-acceptance.criteria.md`
- Must pass:
  - POS sale reduces stock and posts accounting
  - Purchase increases stock and posts accounting
  - Manufacturing updates RM/FG and posts accounting
  - Paid ecommerce order triggers shipment
  - Delivery webhook updates order and emits event
  - Duplicate event replay does not duplicate effects

## 7) Observability and incident readiness
- Structured logs include:
  - `service`
  - `outletId`
  - `eventId`
  - `requestId`
- Track metrics:
  - API latency
  - event lag
  - consumer failure count
  - DLQ depth
- Define incident runbook for:
  - payment callback failures
  - courier webhook retries
  - outbox stuck events
