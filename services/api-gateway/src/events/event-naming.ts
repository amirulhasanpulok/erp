const SEGMENT_PATTERN = /^[a-z0-9_-]+$/;

export function buildCanonicalEventName(domain: string, entity: string, action: string): string {
  const segments = [domain, entity, action].map((part) => part.trim().toLowerCase());
  for (const segment of segments) {
    if (!SEGMENT_PATTERN.test(segment)) {
      throw new Error(`Invalid event segment: ${segment}`);
    }
  }
  return `erp.${segments[0]}.${segments[1]}.${segments[2]}`;
}

const legacyMapping: Record<string, string> = {
  SALE_CREATED: buildCanonicalEventName('sales', 'order', 'created'),
  PURCHASE_RECEIVED: buildCanonicalEventName('purchase', 'receipt', 'received'),
  MANUFACTURE_COMPLETED: buildCanonicalEventName('manufacturing', 'batch', 'completed'),
  ECOM_ORDER_PLACED: buildCanonicalEventName('ecommerce', 'order', 'placed'),
  STOCK_UPDATED: buildCanonicalEventName('inventory', 'stock', 'updated'),
  PAYMENT_CONFIRMED: buildCanonicalEventName('payment', 'transaction', 'confirmed'),
  SHIPMENT_CREATED: buildCanonicalEventName('logistics', 'shipment', 'created'),
  DELIVERY_STATUS_UPDATED: buildCanonicalEventName('logistics', 'delivery', 'status_updated')
};

export function resolveCanonicalEventName(eventType: string): string {
  return legacyMapping[eventType] ?? eventType;
}
