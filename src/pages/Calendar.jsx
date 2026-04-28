import { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { useCalendarStore } from '../store/calendarStore.js';
import { buildCalendarGrid, compactCurrency, maxRevenue } from '../utils/calendarUtils';
import DayDetailDrawer from '../components/calendar/DayDetailDrawer';
import Layout from '../components/layout/Layout';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Single Calendar Cell ──────────────────────────────────────────────────────
function DayCell({ cell, log, maxRev, isSelected, onClick }) {
  const hasData    = !!log;
  const revenue    = log?.totalRevenue    || 0;
  const itemsSold  = log?.totalItemsSold  || 0;
  const heatPct    = hasData ? Math.max(8, (revenue / maxRev) * 100) : 0;

  return (
    <button
      onClick={() => cell.isCurrentMonth && onClick(cell.date)}
      disabled={!cell.isCurrentMonth}
      className={`
        relative w-full aspect-square sm:aspect-auto sm:h-24
        flex flex-col items-start p-1.5 sm:p-2 rounded-xl
        border transition-all text-left overflow-hidden
        ${!cell.isCurrentMonth
          ? 'opacity-25 cursor-default border-transparent'
          : isSelected
            ? 'border-indigo-500 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30 bg-indigo-50 dark:bg-indigo-950/40'
            : hasData
              ? 'border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer bg-white dark:bg-gray-900'
              : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 cursor-pointer bg-white dark:bg-gray-900'
        }
      `}>

      {/* Day number */}
      <span className={`text-xs font-semibold leading-none mb-1.5 z-10 relative
        ${cell.isToday
          ? 'w-5 h-5 flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px]'
          : isSelected
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
        {cell.dayOfMonth}
      </span>

      {/* Revenue heat bar (desktop) */}
      {hasData && (
        <div className="hidden sm:block absolute bottom-0 left-0 right-0 h-1.5
                        bg-gray-100 dark:bg-gray-800 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-indigo-400 dark:bg-indigo-500 rounded-b-xl transition-all"
            style={{ width: `${heatPct}%` }}
          />
        </div>
      )}

      {/* Data preview (desktop) */}
      {hasData && (
        <div className="hidden sm:flex flex-col gap-0.5 z-10 relative w-full">
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400
                           truncate leading-tight">
            {compactCurrency(revenue)}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">
            {itemsSold} sold
          </span>
        </div>
      )}

      {/* Mobile dot indicator */}
      {hasData && (
        <span className="sm:hidden absolute bottom-1 left-1/2 -translate-x-1/2
                         w-1.5 h-1.5 rounded-full bg-indigo-500" />
      )}
    </button>
  );
}

// ── Month summary strip ───────────────────────────────────────────────────────
function MonthSummary({ monthData }) {
  const logs   = Object.values(monthData);
  const days   = logs.length;
  const revenue = logs.reduce((s, l) => s + (l.totalRevenue   || 0), 0);
  const sold   = logs.reduce((s, l) => s + (l.totalItemsSold || 0), 0);

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {[
        { label: 'Month revenue',  value: `₹${revenue.toLocaleString('en-IN')}`, icon: '💰' },
        { label: 'Items sold',     value: sold.toLocaleString(),                  icon: '🛒' },
        { label: 'Active days',    value: days,                                   icon: '📅' },
      ].map(({ label, value, icon }) => (
        <div key={label}
          className="bg-white dark:bg-gray-900 rounded-2xl p-3 border
                     border-gray-100 dark:border-gray-800 text-center">
          <p className="text-lg">{icon}</p>
          <p className="text-base font-bold text-gray-900 dark:text-white leading-tight">
            {value}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main Calendar Page ────────────────────────────────────────────────────────
export default function Calendar() {
  const {
    month, monthData, loading, selectedLog, detailLoading,
    setMonth, fetchMonth, fetchDayDetail, clearSelection,
  } = useCalendarStore();

  const [selectedDate, setSelectedDate] = useState(null);
  const [drawerOpen,   setDrawerOpen]   = useState(false);

  const load = useCallback(() => fetchMonth(month), [month]);
  useEffect(() => { load(); }, [load]);

  const handleDayClick = async (date) => {
    setSelectedDate(date);
    setDrawerOpen(true);
    await fetchDayDetail(date);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedDate(null);
    clearSelection();
  };

  const prevMonth = () => setMonth(dayjs(month).subtract(1, 'month').format('YYYY-MM'));
  const nextMonth = () => setMonth(dayjs(month).add(1,      'month').format('YYYY-MM'));
  const goToday   = () => setMonth(dayjs().format('YYYY-MM'));

  const grid   = buildCalendarGrid(month);
  const maxRev = maxRevenue(monthData);
  const isCurrentMonth = month === dayjs().format('YYYY-MM');

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sales Calendar
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Click any day to see the full breakdown
            </p>
          </div>

          {/* Month navigation */}
          <div className="flex items-center gap-2">
            <button onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                         bg-white dark:bg-gray-900 border border-gray-200
                         dark:border-gray-700 text-gray-600 dark:text-gray-300
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm">
              ‹
            </button>
            <div className="text-center min-w-[120px]">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {dayjs(month).format('MMMM YYYY')}
              </p>
            </div>
            <button onClick={nextMonth}
              disabled={isCurrentMonth}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                         bg-white dark:bg-gray-900 border border-gray-200
                         dark:border-gray-700 text-gray-600 dark:text-gray-300
                         hover:bg-gray-50 dark:hover:bg-gray-800
                         disabled:opacity-40 disabled:cursor-not-allowed transition text-sm">
              ›
            </button>
            {!isCurrentMonth && (
              <button onClick={goToday}
                className="px-3 h-9 rounded-xl bg-indigo-600 text-white
                           text-xs font-medium hover:bg-indigo-700 transition">
                Today
              </button>
            )}
          </div>
        </div>

        {/* ── Month summary ─────────────────────────────────────────── */}
        <MonthSummary monthData={monthData} />

        {/* ── Calendar grid ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border
                        border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
            {WEEKDAYS.map((d) => (
              <div key={d}
                className="py-2.5 text-center text-[11px] font-semibold
                           text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800 p-px">
              {Array.from({ length: 42 }).map((_, i) => (
                <div key={i} className="h-16 sm:h-24 bg-white dark:bg-gray-900
                                        animate-pulse rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px bg-gray-100 dark:bg-gray-800 p-px">
              {grid.map((cell) => (
                <DayCell
                  key={cell.date}
                  cell={cell}
                  log={monthData[cell.date]}
                  maxRev={maxRev}
                  isSelected={cell.date === selectedDate}
                  onClick={handleDayClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Legend ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400
                        dark:text-gray-500 justify-end">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-indigo-500 inline-block" />
            <span>Revenue (bar = relative intensity)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            <span>Has entry</span>
          </div>
        </div>

      </div>

      {/* ── Day detail drawer ─────────────────────────────────────── */}
      <DayDetailDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        date={selectedDate}
        log={selectedLog}
        loading={detailLoading}
      />
    </Layout>
  );
}