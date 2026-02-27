'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type Props = {
  data: Array<{ name: string; value: number }>;
};

const COLORS = ['#0f766e', '#d97706', '#dc2626', '#1d4ed8', '#4338ca'];

export function BreakdownChart({ data }: Props): JSX.Element {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={102} paddingAngle={3}>
            {data.map((item, index) => (
              <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '0.8rem',
              borderColor: 'hsl(var(--border))',
              backgroundColor: 'hsl(var(--card))'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
