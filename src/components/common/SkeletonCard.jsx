export default function SkeletonCard({ rows = 3 }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border
                    border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-100 dark:bg-gray-800 rounded mb-2"
             style={{ width: `${70 + i * 10}%` }} />
      ))}
      <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded-lg w-24 mt-4" />
    </div>
  );
}