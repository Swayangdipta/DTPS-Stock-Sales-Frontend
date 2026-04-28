export default function StatCard({
  label, value, sub, icon, trend, trendLabel, color = 'indigo', loading,
}) {
  const colors = {
    indigo: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    green:  'bg-green-50  dark:bg-green-950/40  text-green-600  dark:text-green-400',
    amber:  'bg-amber-50  dark:bg-amber-950/40  text-amber-600  dark:text-amber-400',
    red:    'bg-red-50    dark:bg-red-950/40    text-red-600    dark:text-red-400',
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border
                      border-gray-100 dark:border-gray-800 animate-pulse">
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="h-7 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border
                    border-gray-100 dark:border-gray-800 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400
                      uppercase tracking-wide">
          {label}
        </p>
        {icon && (
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center
                            text-base ${colors[color]}`}>
            {icon}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
        {value}
      </p>
      {(sub || trend !== undefined) && (
        <div className="flex items-center gap-2 mt-1">
          {sub && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>
          )}
          {trend !== undefined && (
            <span className={`text-xs font-semibold ${
              trend >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-500 dark:text-red-400'
            }`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              {trendLabel && (
                <span className="font-normal text-gray-400 dark:text-gray-500 ml-1">
                  {trendLabel}
                </span>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
}