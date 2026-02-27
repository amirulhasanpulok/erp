import { DashboardView } from '@/components/layout/dashboard-view';
import { getDashboardData, parseDashboardFilters } from '@/lib/dashboard-data';

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function ReportingDashboardPage({ searchParams }: Props): Promise<JSX.Element> {
  const filters = parseDashboardFilters(searchParams);
  const data = await getDashboardData('reporting', filters);
  return <DashboardView data={data} filters={filters} pathname="/dashboard/reporting" />;
}
