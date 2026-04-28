import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import Modal from '../common/Modal';
import { downloadExport, fetchExportPreview } from '../../api/exportApi';

const FORMATS = [
  { key: 'csv',   label: 'CSV',   icon: '📄', desc: 'Plain text, opens in any spreadsheet' },
  { key: 'excel', label: 'Excel', icon: '📊', desc: 'Formatted .xlsx with two sheets'       },
  { key: 'pdf',   label: 'PDF',   icon: '📑', desc: 'Printable report with daily breakdown'  },
];

const PERIOD_TYPES = [
  { key: 'day',   label: 'Single Day'   },
  { key: 'month', label: 'Month'        },
  { key: 'year',  label: 'Year'         },
];

export default function ExportModal({ isOpen, onClose }) {
  const [format,   setFormat]   = useState('excel');
  const [type,     setType]     = useState('month');
  const [date,     setDate]     = useState(dayjs().format('YYYY-MM-DD'));
  const [month,    setMonth]    = useState(dayjs().format('YYYY-MM'));
  const [year,     setYear]     = useState(dayjs().format('YYYY'));
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);
  const [error,    setError]    = useState('');

  // Fetch preview whenever filters change
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        setError('');
        const params = buildParams();
        const data   = await fetchExportPreview(params);
        setPreview(data);
      } catch (err) {
        setPreview(null);
        if (err.response?.status !== 404) setError('Could not load preview');
      }
    };
    load();
  }, [type, date, month, year, isOpen]);

  const buildParams = () => {
    const base = { type };
    if (type === 'day')   return { ...base, date  };
    if (type === 'month') return { ...base, month };
    if (type === 'year')  return { ...base, year  };
    return base;
  };

  const handleDownload = async () => {
    setLoading(true); setProgress(0); setError('');
    try {
      await downloadExport({
        format,
        ...buildParams(),
        onProgress: setProgress,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Export failed. Please try again.');
    } finally {
      setLoading(false); setProgress(0);
    }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl border border-gray-200
    dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900
    dark:text-white text-sm focus:outline-none focus:ring-2
    focus:ring-indigo-500 transition`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data" size="md">
      <div className="space-y-5">

        {/* ── Period type ──────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500
                            dark:text-gray-400 uppercase tracking-wide mb-2">
            Period
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PERIOD_TYPES.map(({ key, label }) => (
              <button key={key} type="button"
                onClick={() => setType(key)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition
                  ${type === key
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Date / month / year picker ───────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500
                            dark:text-gray-400 uppercase tracking-wide mb-2">
            {type === 'day' ? 'Select Date' : type === 'month' ? 'Select Month' : 'Select Year'}
          </label>

          {type === 'day' && (
            <input type="date" value={date}
              max={dayjs().format('YYYY-MM-DD')}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass} />
          )}

          {type === 'month' && (
            <input type="month" value={month}
              max={dayjs().format('YYYY-MM')}
              onChange={(e) => setMonth(e.target.value)}
              className={inputClass} />
          )}

          {type === 'year' && (
            <select value={year} onChange={(e) => setYear(e.target.value)}
              className={inputClass}>
              {Array.from({ length: 5 }, (_, i) => dayjs().year() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
        </div>

        {/* ── Format selector ──────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-gray-500
                            dark:text-gray-400 uppercase tracking-wide mb-2">
            Format
          </label>
          <div className="space-y-2">
            {FORMATS.map(({ key, label, icon, desc }) => (
              <button key={key} type="button"
                onClick={() => setFormat(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  border text-left transition
                  ${format === key
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                <span className="text-2xl">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${
                    format === key
                      ? 'text-indigo-700 dark:text-indigo-300'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition
                  ${format === key
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-gray-300 dark:border-gray-600'
                  }`}>
                  {format === key && (
                    <div className="w-full h-full rounded-full flex items-center
                                    justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Preview banner ───────────────────────────────────────────── */}
        {preview && (
          <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl px-4 py-3
                          border border-indigo-100 dark:border-indigo-900/40">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
              Preview
            </p>
            <div className="grid grid-cols-2 gap-y-1 text-xs text-indigo-600
                            dark:text-indigo-400">
              <span>Date range</span>
              <span className="font-semibold text-right">
                {preview.dateRange.from} → {preview.dateRange.to}
              </span>
              <span>Total rows</span>
              <span className="font-semibold text-right">{preview.rowCount}</span>
              <span>Revenue</span>
              <span className="font-semibold text-right">
                ₹{preview.totals.revenue.toLocaleString('en-IN')}
              </span>
              <span>Items sold</span>
              <span className="font-semibold text-right">{preview.totals.itemsSold}</span>
              <span>Active days</span>
              <span className="font-semibold text-right">{preview.totals.days}</span>
            </div>
          </div>
        )}

        {!preview && !error && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3
                          text-center text-sm text-gray-400 dark:text-gray-500">
            No data found for the selected period
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────── */}
        {error && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border
                          border-red-200 dark:border-red-800 rounded-xl
                          text-red-600 dark:text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* ── Progress bar ─────────────────────────────────────────────── */}
        {loading && progress > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500
                            dark:text-gray-400">
              <span>Generating file…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-gray-200
                       dark:border-gray-700 text-sm font-medium
                       text-gray-600 dark:text-gray-300 transition
                       hover:bg-gray-50 dark:hover:bg-gray-800
                       disabled:opacity-50">
            Cancel
          </button>
          <button type="button"
            onClick={handleDownload}
            disabled={loading || !preview}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700
                       disabled:bg-indigo-400 text-white text-sm font-semibold
                       transition flex items-center justify-center gap-2 shadow-md">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white
                                 border-t-transparent rounded-full animate-spin" />
                Exporting…
              </>
            ) : (
              <>
                ⬇️ Download {format.toUpperCase()}
              </>
            )}
          </button>
        </div>

      </div>
    </Modal>
  );
}