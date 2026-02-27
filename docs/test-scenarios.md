# High-Level Test Scenarios

1. POS sale
- Create sale via `sales-service`
- Verify outbox row created and marked published
- Verify `SALE_CREATED` message published
- Verify `inventory-service` consumes event and deducts stock for same `outlet_id` only

2. Purchase receipt
- Receive purchase via `purchase-service`
- Verify outbox publish of `PURCHASE_RECEIVED`
- Verify `inventory-service` consumes event and increases stock

3. Manufacture complete
- Complete manufacturing job
- Verify outbox publish of `MANUFACTURE_COMPLETED`

4. Payment confirmation
- Initiate payment then call success callback
- Verify `PAYMENT_CONFIRMED` publish
- Verify IPN signature verification endpoint behavior
- Verify `ecommerce-service` marks order confirmed
- Verify `logistics-service` auto-creates shipment and publishes `SHIPMENT_CREATED`

5. Shipment lifecycle
- Create shipment and verify `SHIPMENT_CREATED`
- Send delivery webhook and verify `DELIVERY_STATUS_UPDATED`
- Validate provider-specific creation path for `pathao` and `steadfast` with fallback tracking behavior
- Validate tracking lookup endpoint `/api/v1/logistics/shipments/tracking/:trackingId`

6. Consumer idempotency
- Publish same event envelope twice with same `eventId`
- Verify consumer processes first and skips duplicate
- Verify message acknowledged and not reprocessed

7. DLQ behavior
- Force consumer handler failure
- Verify message is dead-lettered to service DLQ

8. Accounting verification
- Trigger `SALE_CREATED`, `PURCHASE_RECEIVED`, and `MANUFACTURE_COMPLETED`
- Validate `accounts-service` auto journals
- Validate `/api/v1/accounts/trial-balance` and `/api/v1/accounts/ledger?account=...` outputs

9. Ecommerce tracking
- Place order and verify `/api/v1/ecommerce/orders/:id` reflects state transitions (`pending` -> `confirmed` -> delivery status)

10. Gateway rate limit
- Enable `RATE_LIMIT_ENABLED=true` with low `RATE_LIMIT_MAX`
- Send burst requests through API gateway and verify `429` response with `retryAfterMs`

10b. Gateway CORS
- Configure `CORS_ORIGINS` with frontend hosts
- Call gateway from browser frontends and verify successful preflight + authenticated API requests

11. Reporting read model
- Publish canonical events with outlet IDs
- Verify `report_metrics` aggregation updates
- Verify `/api/v1/reports/sales|payments|shipments|accounting` return non-zero aggregated totals

12. Audit persistence
- Write manual audit via `POST /api/v1/audits` (authorized role)
- Publish canonical events and verify snapshot records persist in `audit_records`
- Verify idempotency by replaying same `eventId` and confirming no duplicate audit snapshot rows
- Query `/api/v1/audits?outletId=...&eventType=...&source=...` and verify filtered audit visibility

13. Notification persistence
- Publish canonical events and verify rows created in `notifications`
- Validate terminal status transitions (`queued` -> `sent` or `failed`) and `attempt_count` updates
- Query `/api/v1/notifications?outletId=...&status=...` and verify filtering/limits

14. Outbox retry relayer
- Persist pending outbox rows while RabbitMQ is unavailable
- Restore broker and verify periodic relayer republishes and marks rows as `published`

15. Internal service auth
- Call `/api/v1/payments/initiate` from ecommerce service with `x-internal-key` and verify success
- Repeat without valid key/JWT and verify `401`
