import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', {
  variants: {
    variant: {
      default: 'bg-muted text-muted-foreground',
      success: 'bg-success/15 text-success',
      warning: 'bg-warning/15 text-warning',
      danger: 'bg-danger/15 text-danger'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
