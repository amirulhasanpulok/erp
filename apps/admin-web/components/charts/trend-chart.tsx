'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

type Props = {
  data: Array<{ label: string; value: number }>;
};

export function TrendChart({ data }: Props): JSX.Element {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.55} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: '0.8rem',
              borderColor: 'hsl(var(--border))',
              backgroundColor: 'hsl(var(--card))'
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fill="url(#trendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
