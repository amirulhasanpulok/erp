import { useMemo, useState } from 'react';

export default function EcommerceHome(): JSX.Element {
  const [customerName, setCustomerName] = useState('Demo Customer');
  const [customerPhone, setCustomerPhone] = useState('01700000000');
  const [status, setStatus] = useState('');
  const [trackingOrderId, setTrackingOrderId] = useState('');
  const [trackingResult, setTrackingResult] = useState('');
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';
  const items = useMemo(
    () => [
      { id: 'p1', name: 'Demo Product A', price: 120 },
      { id: 'p2', name: 'Demo Product B', price: 80 }
    ],
    []
  );
  return (
    <main style={{ padding: 24, fontFamily: 'Segoe UI, sans-serif' }}>
      <h1>Ecommerce Storefront</h1>
      <p>Gateway: {API_BASE}</p>
      <div style={{ display: 'grid', gap: 8, maxWidth: 420, marginBottom: 16 }}>
        <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer name" />
        <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Customer phone" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(220px,1fr))', gap: 14 }}>
        {items.map((p) => (
          <article key={p.id} style={{ border: '1px solid #ddd', borderRadius: 10, padding: 12 }}>
            <h3>{p.name}</h3>
            <p>BDT {p.price}</p>
            <button
              onClick={async () => {
                const token = localStorage.getItem('access_token') ?? '';
                const payload = {
                  outletId: '00000000-0000-0000-0000-000000000001',
                  productId: '00000000-0000-0000-0000-000000000001',
                  quantity: '1',
                  customerName,
                  customerPhone,
                  total: String(p.price)
                };
                try {
                  const response = await fetch(`${API_BASE}/api/v1/ecommerce/orders`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                  });
                  const data = (await response.json()) as {
                    id?: string;
                    paymentRedirectUrl?: string | null;
                    statusCode?: number;
                  };
                  if (data.id) {
                    setStatus(`Order created: ${data.id}`);
                    if (data.paymentRedirectUrl) {
                      window.location.href = data.paymentRedirectUrl;
                    }
                  } else {
                    setStatus(`Checkout failed (${data.statusCode ?? response.status})`);
                  }
                } catch {
                  setStatus('Checkout failed (network)');
                }
              }}
            >
              Checkout
            </button>
          </article>
        ))}
      </div>
      <p>{status}</p>
      <section style={{ marginTop: 24, maxWidth: 520 }}>
        <h3>Order Tracking</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={trackingOrderId}
            onChange={(e) => setTrackingOrderId(e.target.value)}
            placeholder="Order ID"
            style={{ flex: 1 }}
          />
          <button
            onClick={async () => {
              const token = localStorage.getItem('access_token') ?? '';
              try {
                const response = await fetch(`${API_BASE}/api/v1/ecommerce/orders/${trackingOrderId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                const data = (await response.json()) as { status?: string; statusCode?: number };
                setTrackingResult(
                  response.ok ? `Status: ${data.status ?? 'unknown'}` : `Failed (${data.statusCode ?? response.status})`
                );
              } catch {
                setTrackingResult('Failed (network)');
              }
            }}
          >
            Track
          </button>
        </div>
        <p>{trackingResult}</p>
      </section>
    </main>
  );
}
