export default function Badge({ label, color = '#6366f1' }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: color + '22', color }}>
      {label}
    </span>
  );
}