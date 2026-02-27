# ERP Platform Runbook

## 1. Prepare environment
- Copy `.env.example` to `.env` and set:
  - `JWT_ACCESS_SECRET`
  - `INTERNAL_SERVICE_KEY`
  - RabbitMQ/Redis ports if needed

## 2. Install dependencies
```powershell
./scripts/install-all.ps1
```

## 3. Start infrastructure and services
```powershell
docker compose up -d --build
```

## 4. Run migrations
```powershell
./scripts/run-migrations.ps1
```

## 5. Access endpoints
- API Gateway: `http://localhost:3000`
- Gateway Swagger: `http://localhost:3000/api/docs`
- Admin: `http://localhost:3100`
- Ecommerce: `http://localhost:3200`
- POS: `http://localhost:3300`
- RabbitMQ UI: `http://localhost:15672`

## 6. Canonical event health checks
- Trigger:
  - `SALE_CREATED`
  - `PURCHASE_RECEIVED`
  - `MANUFACTURE_COMPLETED`
  - `ECOM_ORDER_PLACED`
  - `PAYMENT_CONFIRMED`
  - `SHIPMENT_CREATED`
  - `DELIVERY_STATUS_UPDATED`
- Verify:
  - inventory stock updates
  - accounting auto-journals
  - reporting metrics
  - notification records
  - audit snapshots

