import 'server-only';

export type DashboardSection =
  | 'super-admin'
  | 'finance'
  | 'sales'
  | 'inventory'
  | 'reporting';

export type DashboardFilters = {
  from: string;
  to: string;
  page: number;
  limit: number;
  query: string;
};

export type MetricCard = {
  label: string;
  value: string;
  delta: string;
  tone: 'default' | 'success' | 'warning' | 'danger';
};

export type DashboardRow = {
  id: string;
  name: string;
  status: string;
  amount: number;
  date: string;
  reference: string;
};

export type DashboardData = {
  title: string;
  metrics: MetricCard[];
  trend: Array<{ label: string; value: number }>;
  breakdown: Array<{ name: string; value: number }>;
  rows: DashboardRow[];
  totalRows: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000';

function parseDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

function dateDiffDays(from: string, to: string): number {
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  const diff = Math.ceil((toDate.getTime() - fromDate.getTime()) / 86_400_000);
  return diff > 0 ? diff : 1;
}

async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

function buildRows(prefix: string, count: number): DashboardRow[] {
  return Array.from({ length: count }).map((_, index) => ({
    id: `${prefix}-${index + 1}`,
    name: `${prefix.toUpperCase()} Item ${index + 1}`,
    status: index % 4 === 0 ? 'pending' : index % 3 === 0 ? 'warning' : 'completed',
    amount: 1000 + index * 131,
    date: new Date(Date.now() - index * 86_400_000).toISOString().slice(0, 10),
    reference: `REF-${prefix.slice(0, 3).toUpperCase()}-${1000 + index}`
  }));
}

function paginateRows(rows: DashboardRow[], page: number, limit: number, query: string): {
  totalRows: number;
  rows: DashboardRow[];
} {
  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? rows.filter((row) => {
        const source = `${row.name} ${row.status} ${row.reference}`.toLowerCase();
        return source.includes(normalizedQuery);
      })
    : rows;

  const start = (page - 1) * limit;
  return {
    totalRows: filtered.length,
    rows: filtered.slice(start, start + limit)
  };
}

export async function getDashboardData(
  section: DashboardSection,
  filters: DashboardFilters
): Promise<DashboardData> {
  const daySpan = dateDiffDays(filters.from, filters.to);
  const health = await safeGet<{ status?: string }>('/api/v1/health', { status: 'unknown' });
  const salesSummary = await safeGet<{ totalEvents?: number }>(
    '/api/v1/reports/sales',
    { totalEvents: 0 }
  );

  if (section === 'super-admin') {
    const baseRows = buildRows('approval', 42);
    const paged = paginateRows(baseRows, filters.page, filters.limit, filters.query);

    return {
      title: 'Super Admin Dashboard',
      metrics: [
        { label: 'Total Revenue', value: '$1,280,400', delta: '+8.9%', tone: 'success' },
        { label: 'Total Expenses', value: '$890,330', delta: '+4.2%', tone: 'warning' },
        { label: 'Net Profit', value: '$390,070', delta: '+12.4%', tone: 'success' },
        {
          label: 'Sales (Today / Month)',
          value: `${Math.max(45, Math.floor(daySpan * 3))} / ${salesSummary.totalEvents ?? 0}`,
          delta: '+6.8%',
          tone: 'default'
        },
        { label: 'Inventory Value', value: '$640,900', delta: '-1.1%', tone: 'warning' },
        { label: 'Low Stock Alerts', value: '17', delta: '+3', tone: 'danger' },
        { label: 'Pending Approvals', value: '12', delta: '-2', tone: 'warning' },
        { label: 'Active Users', value: '148', delta: '+9', tone: 'success' },
        {
          label: 'Event Queue Health',
          value: health.status === 'ok' ? 'Healthy' : 'Degraded',
          delta: 'Live',
          tone: health.status === 'ok' ? 'success' : 'danger'
        }
      ],
      trend: Array.from({ length: 14 }).map((_, i) => ({
        label: `D${i + 1}`,
        value: 22000 + i * 1300 + (i % 2 === 0 ? 2000 : -1000)
      })),
      breakdown: [
        { name: 'Approved', value: 62 },
        { name: 'Waiting', value: 24 },
        { name: 'Escalated', value: 14 }
      ],
      totalRows: paged.totalRows,
      rows: paged.rows
    };
  }

  if (section === 'finance') {
    const baseRows = buildRows('invoice', 56);
    const paged = paginateRows(baseRows, filters.page, filters.limit, filters.query);

    return {
      title: 'Finance Dashboard',
      metrics: [
        { label: 'AR Aging', value: '$210,330', delta: '+2.4%', tone: 'warning' },
        { label: 'AP Aging', value: '$144,990', delta: '-0.6%', tone: 'success' },
        { label: 'Cash Position', value: '$95,700', delta: '+4.9%', tone: 'success' },
        { label: 'P&L Snapshot', value: '$52,440', delta: '+9.1%', tone: 'success' },
        { label: 'Bank Balances', value: '$202,500', delta: '+1.2%', tone: 'default' },
        { label: 'Invoice Status', value: '62 open', delta: '-3', tone: 'warning' }
      ],
      trend: Array.from({ length: 12 }).map((_, i) => ({
        label: `W${i + 1}`,
        value: 12000 + i * 950 + (i % 4 === 0 ? 2500 : -700)
      })),
      breakdown: [
        { name: 'Paid', value: 48 },
        { name: 'Partially Paid', value: 19 },
        { name: 'Overdue', value: 33 }
      ],
      totalRows: paged.totalRows,
      rows: paged.rows
    };
  }

  if (section === 'sales') {
    const baseRows = buildRows('order', 63);
    const paged = paginateRows(baseRows, filters.page, filters.limit, filters.query);

    return {
      title: 'Sales Dashboard',
      metrics: [
        { label: 'Sales by Day', value: '$67,100', delta: '+5.1%', tone: 'success' },
        { label: 'Top Products', value: '24', delta: '+2', tone: 'default' },
        { label: 'Top Customers', value: '17', delta: '+3', tone: 'default' },
        { label: 'Fulfillment Rate', value: '94.1%', delta: '+1.8%', tone: 'success' }
      ],
      trend: Array.from({ length: 10 }).map((_, i) => ({
        label: `D${i + 1}`,
        value: 5000 + i * 900 + (i % 2 === 0 ? 1200 : -400)
      })),
      breakdown: [
        { name: 'Delivered', value: 71 },
        { name: 'Processing', value: 17 },
        { name: 'Returned', value: 12 }
      ],
      totalRows: paged.totalRows,
      rows: paged.rows
    };
  }

  if (section === 'inventory') {
    const baseRows = buildRows('stock', 47);
    const paged = paginateRows(baseRows, filters.page, filters.limit, filters.query);

    return {
      title: 'Inventory Dashboard',
      metrics: [
        { label: 'Stock Value', value: '$441,280', delta: '+1.7%', tone: 'success' },
        { label: 'Fast Moving Items', value: '83', delta: '+4', tone: 'success' },
        { label: 'Slow Moving Items', value: '26', delta: '+1', tone: 'warning' },
        { label: 'Reorder Alerts', value: '19', delta: '+2', tone: 'danger' },
        { label: 'Warehouse Comparison', value: '4 active', delta: 'stable', tone: 'default' }
      ],
      trend: Array.from({ length: 9 }).map((_, i) => ({
        label: `W${i + 1}`,
        value: 340 + i * 18 + (i % 3 === 0 ? -20 : 15)
      })),
      breakdown: [
        { name: 'Healthy Stock', value: 68 },
        { name: 'Reorder Soon', value: 22 },
        { name: 'Critical', value: 10 }
      ],
      totalRows: paged.totalRows,
      rows: paged.rows
    };
  }

  const baseRows = buildRows('kpi', 88);
  const paged = paginateRows(baseRows, filters.page, filters.limit, filters.query);

  return {
    title: 'Reporting Dashboard',
    metrics: [
      { label: 'KPI Widgets', value: '32', delta: '+5', tone: 'success' },
      { label: 'Scheduled Exports', value: '11', delta: '+1', tone: 'default' },
      { label: 'CSV/Excel Jobs', value: '89', delta: '+13%', tone: 'success' },
      { label: 'Data Freshness', value: '< 5 min', delta: 'live', tone: 'success' }
    ],
    trend: Array.from({ length: 15 }).map((_, i) => ({
      label: `T${i + 1}`,
      value: 80 + i * 6 + (i % 2 === 0 ? 8 : -4)
    })),
    breakdown: [
      { name: 'CSV', value: 55 },
      { name: 'Excel', value: 30 },
      { name: 'PDF', value: 15 }
    ],
    totalRows: paged.totalRows,
    rows: paged.rows
  };
}

export function parseDashboardFilters(
  searchParams: Record<string, string | string[] | undefined>
): DashboardFilters {
  const now = new Date();
  const defaultTo = now.toISOString().slice(0, 10);
  const defaultFrom = new Date(now.getTime() - 30 * 86_400_000).toISOString().slice(0, 10);

  const from = typeof searchParams.from === 'string' ? searchParams.from : defaultFrom;
  const to = typeof searchParams.to === 'string' ? searchParams.to : defaultTo;

  const rawPage = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1;
  const rawLimit = typeof searchParams.limit === 'string' ? Number(searchParams.limit) : 10;

  return {
    from,
    to,
    page: Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage,
    limit: Number.isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 50),
    query: typeof searchParams.q === 'string' ? searchParams.q : ''
  };
}
