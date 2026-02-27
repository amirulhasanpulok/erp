export type DashboardRole = 'super_admin' | 'accountant' | 'manager' | 'inventory_manager' | 'sales_manager';

export type NavItem = {
  href: string;
  label: string;
  icon: 'activity' | 'finance' | 'sales' | 'inventory' | 'reporting';
  roles: DashboardRole[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard/super-admin',
    label: 'Super Admin',
    icon: 'activity',
    roles: ['super_admin', 'manager']
  },
  {
    href: '/dashboard/finance',
    label: 'Finance',
    icon: 'finance',
    roles: ['super_admin', 'accountant', 'manager']
  },
  {
    href: '/dashboard/sales',
    label: 'Sales',
    icon: 'sales',
    roles: ['super_admin', 'sales_manager', 'manager']
  },
  {
    href: '/dashboard/inventory',
    label: 'Inventory',
    icon: 'inventory',
    roles: ['super_admin', 'inventory_manager', 'manager']
  },
  {
    href: '/dashboard/reporting',
    label: 'Reporting',
    icon: 'reporting',
    roles: ['super_admin', 'accountant', 'manager']
  }
];
