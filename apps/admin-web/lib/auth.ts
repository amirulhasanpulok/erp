import { cookies } from 'next/headers';
import { DashboardRole } from './navigation';

const DEFAULT_ROLE: DashboardRole = 'super_admin';

export function resolveDashboardRole(): DashboardRole {
  const role = cookies().get('erp_role')?.value as DashboardRole | undefined;
  if (!role) {
    return DEFAULT_ROLE;
  }

  const allowed: DashboardRole[] = [
    'super_admin',
    'accountant',
    'manager',
    'inventory_manager',
    'sales_manager'
  ];

  return allowed.includes(role) ? role : DEFAULT_ROLE;
}
