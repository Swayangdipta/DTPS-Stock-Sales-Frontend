import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

export default function CategoryPieChart({ data }) {
  if (!data?.length) return (
    <div className="h-52 flex items-center justify-center
                    text-gray-400 dark:text-gray-600 text-sm">
      No data for this period
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="revenue"
          nameKey="name">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color || '#6366f1'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Revenue']}
          contentStyle={{
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            fontSize: 12,
          }}
        />
        <Legend
          iconType="circle" iconSize={8}
          formatter={(val) => (
            <span style={{ fontSize: 11, color: '#6b7280' }}>{val}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}