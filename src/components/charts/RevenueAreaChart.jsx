import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100
                    dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name === 'revenue'
            ? `₹${p.value.toLocaleString('en-IN')}`
            : `${p.value} items`}
        </p>
      ))}
    </div>
  );
};

export default function RevenueAreaChart({ data, showItems = false }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="itemsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"
                       className="dark:[stroke:#374151]" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }}
               axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }}
               axisLine={false} tickLine={false}
               tickFormatter={(v) =>
                 v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`
               } />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" name="revenue"
              stroke="#6366f1" strokeWidth={2}
              fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4 }} />
        {showItems && (
          <Area type="monotone" dataKey="itemsSold" name="itemsSold"
                stroke="#22c55e" strokeWidth={2}
                fill="url(#itemsGrad)" dot={false} activeDot={{ r: 4 }} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}