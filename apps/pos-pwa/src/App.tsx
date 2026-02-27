import { useState } from 'react';

export function App(): JSX.Element {
  const [barcode, setBarcode] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('');
  const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';
  return (
    <main style={{ padding: 16, fontFamily: 'Segoe UI, sans-serif' }}>
      <h1>POS Billing</h1>
      <p>Gateway: {API_BASE}</p>
      <input
        placeholder="Scan barcode"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />
      <button
        onClick={() => {
          if (!barcode.trim()) return;
          setItems((p) => [...p, barcode.trim()]);
          setBarcode('');
        }}
      >
        Add
      </button>
      <ul>
        {items.map((i, idx) => (
          <li key={`${i}-${idx}`}>{i}</li>
        ))}
      </ul>
      <button
        onClick={async () => {
          const token = localStorage.getItem('access_token') ?? '';
          const total = (items.length * 100).toFixed(2);
          const payload = {
            outletId: '00000000-0000-0000-0000-000000000001',
            productId: '00000000-0000-0000-0000-000000000001',
            quantity: String(items.length || 1),
            total,
            paymentMethod: 'cash'
          };
          try {
            const response = await fetch(`${API_BASE}/api/v1/sales`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(payload)
            });
            const data = (await response.json()) as { id?: string; statusCode?: number };
            setStatus(data.id ? `Sale created: ${data.id}` : `Failed (${data.statusCode ?? response.status})`);
          } catch {
            setStatus('Failed (network)');
          }
        }}
      >
        Checkout
      </button>
      <p>{status}</p>
    </main>
  );
}
