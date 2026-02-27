import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  pathname: string;
  page: number;
  limit: number;
  totalRows: number;
  query: string;
  from: string;
  to: string;
};

export function Pagination({ pathname, page, limit, totalRows, query, from, to }: Props): JSX.Element {
  const totalPages = Math.max(1, Math.ceil(totalRows / limit));
  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  const buildHref = (targetPage: number): string => {
    const params = new URLSearchParams();
    params.set('page', String(targetPage));
    params.set('limit', String(limit));
    if (query.trim()) params.set('q', query.trim());
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">
        Page {page} of {totalPages} ({totalRows} rows)
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(previousPage)}
          className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), page === 1 && 'pointer-events-none opacity-50')}
        >
          Previous
        </Link>
        <Link
          href={buildHref(nextPage)}
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'sm' }),
            page >= totalPages && 'pointer-events-none opacity-50'
          )}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
