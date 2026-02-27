const DOMAIN_SEGMENT = /^[a-z0-9_-]+$/;

export function buildEventName(domain: string, entity: string, action: string): string {
  const parts = [domain, entity, action].map((part) => part.trim().toLowerCase());
  for (const segment of parts) {
    if (!DOMAIN_SEGMENT.test(segment)) {
      throw new Error(`Invalid event segment: ${segment}`);
    }
  }
  return `erp.${parts[0]}.${parts[1]}.${parts[2]}`;
}

export const legacyToCanonicalEventMap: Record<string, string> = {
  SALE_CREATED: buildEventName('sales', 'order', 'created'),
  PURCHASE_RECEIVED: buildEventName('purchase', 'receipt', 'received'),
  MANUFACTURE_COMPLETED: buildEventName('manufacturing', 'batch', 'completed'),
  ECOM_ORDER_PLACED: buildEventName('ecommerce', 'order', 'placed'),
  STOCK_UPDATED: buildEventName('inventory', 'stock', 'updated'),
  PAYMENT_CONFIRMED: buildEventName('payment', 'transaction', 'confirmed'),
  SHIPMENT_CREATED: buildEventName('logistics', 'shipment', 'created'),
  DELIVERY_STATUS_UPDATED: buildEventName('logistics', 'delivery', 'status_updated')
};

export function resolveCanonicalEventName(eventType: string): string {
  return legacyToCanonicalEventMap[eventType] ?? eventType;
}
