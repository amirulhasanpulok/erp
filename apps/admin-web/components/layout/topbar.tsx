'use client';

import { Bell, Moon, Search, Sun } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useThemeMode } from '@/components/providers/theme-provider';

function Breadcrumb(): JSX.Element {
  const pathname = usePathname();
  const currentPath = pathname ?? '';

  const crumbs = useMemo(() => {
    const segments = currentPath.split('/').filter(Boolean);
    if (segments.length === 0) return ['dashboard'];
    return segments.map((segment) => segment.replace(/-/g, ' '));
  }, [currentPath]);

  return (
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
      {crumbs.join(' / ')}
    </p>
  );
}

function DateRangeControl(): JSX.Element {
  const searchParams = useSearchParams();
  const currentParams = searchParams ?? new URLSearchParams();
  const router = useRouter();

  const [from, setFrom] = useState(currentParams.get('from') ?? '');
  const [to, setTo] = useState(currentParams.get('to') ?? '');

  const apply = (): void => {
    const params = new URLSearchParams(currentParams.toString());
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    params.set('page', '1');
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Input type="date" className="h-9 w-36" value={from} onChange={(e) => setFrom(e.target.value)} />
      <Input type="date" className="h-9 w-36" value={to} onChange={(e) => setTo(e.target.value)} />
      <Button variant="secondary" size="sm" onClick={apply}>
        Apply
      </Button>
    </div>
  );
}

export function Topbar(): JSX.Element {
  const { theme, toggleTheme } = useThemeMode();
  const searchParams = useSearchParams();
  const currentParams = searchParams ?? new URLSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(currentParams.get('q') ?? '');

  const handleSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const params = new URLSearchParams(currentParams.toString());
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    router.replace(`?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1">
          <Breadcrumb />
          <h2 className="font-heading text-xl font-semibold">Live ERP Workspace</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search approvals, invoices, items"
              className="h-9 w-72 pl-8"
            />
          </form>

          <DateRangeControl />

          <Button variant="secondary" size="sm" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Button variant="secondary" size="sm" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
