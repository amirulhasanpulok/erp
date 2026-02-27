# ERP E2E Acceptance Criteria

This checklist defines end-to-end acceptance for canonical ERP flows.

## 1) POS sale flow
- Create a sale from POS (`sales-service`).
- Verify stock decrement in `inventory-service` for same `outlet_id`.
- Verify `SALE_CREATED` event emitted.
- Verify `accounts-service` auto-posts double-entry journal for sale.
- Verify `reporting-service` read model increments sale metrics.

## 2) Purchase receipt flow
- Receive purchase goods (`purchase-service`).
- Verify stock increment in `inventory-service` for same `outlet_id`.
- Verify `PURCHASE_RECEIVED` event emitted.
- Verify `accounts-service` auto-posts purchase journal.
- Verify `reporting-service` read model increments purchase metrics.

## 3) Manufacturing completion flow
- Complete work order (`manufacturing-service`) with RM consume + FG produce.
- Verify inventory ledger updates both RM and FG in same outlet.
- Verify `MANUFACTURE_COMPLETED` event emitted.
- Verify `accounts-service` auto-posts manufacturing journal.

## 4) Ecommerce payment and shipment orchestration
- Place ecommerce order (`ecommerce-service`) and emit `ECOM_ORDER_PLACED`.
- Initiate SSLCommerz payment session (`payment-service`).
- Simulate successful callback/IPN verification.
- Verify order becomes confirmed/paid.
- Verify `PAYMENT_CONFIRMED` event emitted exactly once (idempotent replay-safe).
- Verify logistics auto-creates shipment and emits `SHIPMENT_CREATED`.

## 5) Delivery status flow
- Send logistics webhook (`logistics-service`) for delivery updates.
- Verify order status update in `ecommerce-service`.
- Verify `DELIVERY_STATUS_UPDATED` event emitted.
- Verify notification/audit/reporting consumers process event idempotently.

## 6) Idempotency and DLQ behavior
- Replay same event envelope (same `eventId`) to each consumer; verify no duplicate side effects.
- Force handler error; verify message reaches service DLQ and can be replayed.

## 7) Security and tenancy checks
- Verify each protected endpoint rejects missing/invalid JWT.
- Verify role-guarded endpoints enforce role claims.
- Verify stock/account/order mutations require valid `outlet_id` scope.
