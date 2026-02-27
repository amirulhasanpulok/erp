import { useEffect, useState } from 'react';

type CardItem = { label: string; value: string };

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

export default function AdminHome(): JSX.Element {
  const [cards, setCards] = useState<CardItem[]>([
    { label: 'Outlets', value: '-' },
    { label: 'Products', value: '-' },
    { label: 'Sales Reports', value: '-' },
    { label: 'Payment Reports', value: '-' },
    { label: 'Shipment Reports', value: '-' },
    { label: 'Accounting Reports', value: '-' },
    { label: 'Notifications', value: '-' },
    { label: 'Audit Records', value: '-' }
  ]);

  useEffect(() => {
    const load = async (): Promise<void> => {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('access_token') ?? ''}`
      };
      const [outlets, products, salesReport, paymentsReport, shipmentsReport, accountingReport, notifications, audits] =
        await Promise.all([
          fetch(`${API_BASE}/api/v1/outlets`, { headers }).then((r) => r.json()).catch(() => []),
          fetch(`${API_BASE}/api/v1/products`, { headers }).then((r) => r.json()).catch(() => []),
          fetch(`${API_BASE}/api/v1/reports/sales`, { headers }).then((r) => r.json()).catch(() => null),
          fetch(`${API_BASE}/api/v1/reports/payments`, { headers }).then((r) => r.json()).catch(() => null),
          fetch(`${API_BASE}/api/v1/reports/shipments`, { headers }).then((r) => r.json()).catch(() => null),
          fetch(`${API_BASE}/api/v1/reports/accounting`, { headers }).then((r) => r.json()).catch(() => null),
          fetch(`${API_BASE}/api/v1/notifications?limit=1`, { headers }).then((r) => r.json()).catch(() => []),
          fetch(`${API_BASE}/api/v1/audits?limit=1`, { headers }).then((r) => r.json()).catch(() => [])
        ]);
      setCards([
        { label: 'Outlets', value: String(Array.isArray(outlets) ? outlets.length : 0) },
        { label: 'Products', value: String(Array.isArray(products) ? products.length : 0) },
        { label: 'Sales Reports', value: salesReport?.report ?? 'n/a' },
        { label: 'Payment Reports', value: paymentsReport?.report ?? 'n/a' },
        { label: 'Shipment Reports', value: shipmentsReport?.report ?? 'n/a' },
        { label: 'Accounting Reports', value: accountingReport?.report ?? 'n/a' },
        { label: 'Notifications', value: Array.isArray(notifications) ? `${notifications.length}+` : 'n/a' },
        { label: 'Audit Records', value: Array.isArray(audits) ? `${audits.length}+` : 'n/a' }
      ]);
    };
    void load();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'Segoe UI, sans-serif' }}>
      <h1>ERP Admin Dashboard</h1>
      <p>Gateway: {API_BASE}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(180px,1fr))', gap: 12 }}>
        {cards.map((c) => (
          <section key={c.label} style={{ border: '1px solid #e2e2e2', borderRadius: 8, padding: 12 }}>
            <h3 style={{ margin: 0 }}>{c.label}</h3>
            <p style={{ margin: '8px 0 0', fontSize: 20, fontWeight: 700 }}>{c.value}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
