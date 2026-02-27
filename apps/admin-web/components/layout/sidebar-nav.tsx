'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Boxes,
  CircleDollarSign,
  FileSpreadsheet
} from 'lucide-react';
import { NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';

const iconMap = {
  activity: Activity,
  finance: CircleDollarSign,
  sales: BarChart3,
  inventory: Boxes,
  reporting: FileSpreadsheet
} as const;

export function SidebarNav({ items }: { items: NavItem[] }): JSX.Element {
  const pathname = usePathname();
  const currentPath = pathname ?? '';

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-border/70 bg-card/80 p-6 backdrop-blur lg:flex">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-primary">ERP Control</p>
        <h1 className="mt-2 font-heading text-2xl font-bold">Enterprise Dashboard</h1>
      </div>

      <nav className="mt-8 space-y-2">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          const active = currentPath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-border/80 bg-background/75 p-4 text-xs text-muted-foreground">
        Role-based navigation is active. Change role with cookie `erp_role`.
      </div>
    </aside>
  );
}
