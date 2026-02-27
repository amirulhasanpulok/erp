import { BreakdownChart } from '@/components/charts/breakdown-chart';
import { TrendChart } from '@/components/charts/trend-chart';
import { QueueHealthCard } from '@/components/layout/queue-health-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { DashboardData, DashboardFilters } from '@/lib/dashboard-data';

function toneToBadgeVariant(
  tone: 'default' | 'success' | 'warning' | 'danger'
): 'default' | 'success' | 'warning' | 'danger' {
  return tone;
}

export function DashboardView({
  data,
  filters,
  pathname
}: {
  data: DashboardData;
  filters: DashboardFilters;
  pathname: string;
}): JSX.Element {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <section>
        <h1 className="font-heading text-2xl font-bold">{data.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Date range: {filters.from} to {filters.to}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <Card key={metric.label} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>{metric.label}</CardDescription>
              <Badge variant={toneToBadgeVariant(metric.tone)}>{metric.delta}</Badge>
            </div>
            <CardTitle className="font-heading text-2xl">{metric.value}</CardTitle>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Server-fetched data rendered in client chart component</CardDescription>
          <div className="mt-4">
            <TrendChart data={data.trend} />
          </div>
        </Card>

        <Card>
          <CardTitle>Status Breakdown</CardTitle>
          <CardDescription>Operational distribution by current filter scope</CardDescription>
          <div className="mt-4">
            <BreakdownChart data={data.breakdown} />
          </div>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardTitle>Operational Rows</CardTitle>
          <CardDescription>Paginated and filterable rows for this module</CardDescription>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-2 py-3">Reference</th>
                  <th className="px-2 py-3">Name</th>
                  <th className="px-2 py-3">Status</th>
                  <th className="px-2 py-3 text-right">Amount</th>
                  <th className="px-2 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.id} className="border-t border-border/70">
                    <td className="px-2 py-3 font-medium">{row.reference}</td>
                    <td className="px-2 py-3">{row.name}</td>
                    <td className="px-2 py-3">
                      <Badge
                        variant={
                          row.status === 'completed'
                            ? 'success'
                            : row.status === 'warning'
                              ? 'warning'
                              : 'default'
                        }
                      >
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-2 py-3 text-right">${row.amount.toLocaleString()}</td>
                    <td className="px-2 py-3 text-right">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4">
            <Pagination
              pathname={pathname}
              page={filters.page}
              limit={filters.limit}
              totalRows={data.totalRows}
              query={filters.query}
              from={filters.from}
              to={filters.to}
            />
          </div>
        </Card>

        <QueueHealthCard />
      </section>
    </div>
  );
}
