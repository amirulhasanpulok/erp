import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Topbar } from '@/components/layout/topbar';
import { resolveDashboardRole } from '@/lib/auth';
import { NAV_ITEMS } from '@/lib/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const role = resolveDashboardRole();
  const navItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="min-h-screen lg:flex">
      <SidebarNav items={navItems} />
      <div className="flex-1">
        <Topbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
