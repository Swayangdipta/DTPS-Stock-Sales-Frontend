import dayjs from 'dayjs';

/**
 * Build a 6-row × 7-col grid for the given month.
 * Each cell: { date: 'YYYY-MM-DD', isCurrentMonth, isToday, dayOfMonth }
 */
export function buildCalendarGrid(monthStr) {
  const start     = dayjs(monthStr + '-01');
  const firstDay  = start.day();           // 0=Sun … 6=Sat
  const daysInMonth = start.daysInMonth();
  const today     = dayjs().format('YYYY-MM-DD');

  const cells = [];

  // Leading days from previous month
  for (let i = 0; i < firstDay; i++) {
    const d = start.subtract(firstDay - i, 'day');
    cells.push({
      date:           d.format('YYYY-MM-DD'),
      isCurrentMonth: false,
      isToday:        false,
      dayOfMonth:     d.date(),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = start.date(d).format('YYYY-MM-DD');
    cells.push({
      date,
      isCurrentMonth: true,
      isToday:        date === today,
      dayOfMonth:     d,
    });
  }

  // Trailing days to complete the grid
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    const d = start.date(daysInMonth).add(i, 'day');
    cells.push({
      date:           d.format('YYYY-MM-DD'),
      isCurrentMonth: false,
      isToday:        false,
      dayOfMonth:     d.date(),
    });
  }

  return cells;
}

/** Format a number as compact currency: 1200 → ₹1.2k */
export function compactCurrency(n) {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)   return `₹${(n / 1_000).toFixed(1)}k`;
  return `₹${n}`;
}

/** Max revenue in a month — used to scale heat bars */
export function maxRevenue(monthData) {
  return Math.max(1, ...Object.values(monthData).map((l) => l.totalRevenue || 0));
}