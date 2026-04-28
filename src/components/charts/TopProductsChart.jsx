import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe',
                '#06b6d4','#22c55e','#f59e0b'];

export default function TopProductsChart({ data }) {
  const chartData = data.map((d) => ({
    name:    d.name?.length > 14 ? d.name.slice(0, 14) + '…' : d.name,
    revenue: d.revenue,
    qty:     d.totalQty,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"
                       className="dark:[stroke:#374151]" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }}
               axisLine={false} tickLine={false}
               tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
        <YAxis type="category" dataKey="name"
               tick={{ fontSize: 11, fill: '#6b7280' }}
               axisLine={false} tickLine={false} width={90} />
        <Tooltip
          formatter={(val, name) =>
            name === 'revenue'
              ? [`₹${val.toLocaleString('en-IN')}`, 'Revenue']
              : [val, 'Qty sold']
          }
          contentStyle={{
            background: 'var(--tooltip-bg, #fff)',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={18}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}