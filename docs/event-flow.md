# Canonical Event Flow

Canonical event exchange: `erp.events` (topic)

Routing keys:
- `SALE_CREATED`
- `PURCHASE_RECEIVED`
- `MANUFACTURE_COMPLETED`
- `ECOM_ORDER_PLACED`
- `STOCK_UPDATED`
- `PAYMENT_CONFIRMED`
- `SHIPMENT_CREATED`
- `DELIVERY_STATUS_UPDATED`

Envelope:
```json
{
  "eventId": "uuid",
  "eventType": "string",
  "timestamp": "ISO_DATE",
  "source": "service-name",
  "version": "1.0",
  "data": {}
}
```

Outbox-enabled publishers:
- `sales-service`
- `purchase-service`
- `manufacturing-service`
- `payment-service`
- `logistics-service`
- `inventory-service`
- `ecommerce-service`

Queue/DLQ convention per service:
- `RABBITMQ_QUEUE=<service>.events.q`
- `RABBITMQ_DLK=<service>.events.dlq`
- `EVENT_IDEMPOTENCY_TTL_SECONDS=86400` (default)

Consumers with Redis idempotency:
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

Automatic accounting postings:
- `SALE_CREATED` -> Dr `Cash`, Cr `Sales Revenue`
- `PURCHASE_RECEIVED` -> Dr `Inventory`, Cr `Accounts Payable`
- `MANUFACTURE_COMPLETED` -> Dr `Finished Goods`, Cr `Raw Materials`

Ecommerce integration notes:
- `ECOM_ORDER_PLACED` is published at order placement.
- `ecommerce-service` also requests payment session synchronously from `payment-service` to return checkout redirect URL.
- `payment-service` consumes `ECOM_ORDER_PLACED` and creates initiated payment records idempotently.
- On `PAYMENT_CONFIRMED`, ecommerce marks order confirmed and emits internal `SALE_CREATED` (canonical contract) for downstream stock/accounting updates.

Stock automation notes:
- `inventory-service` consumes `SALE_CREATED`, `PURCHASE_RECEIVED`, and `MANUFACTURE_COMPLETED`.
- Every resulting stock mutation emits canonical `STOCK_UPDATED` via outbox dispatch.
