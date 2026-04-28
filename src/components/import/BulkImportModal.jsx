import { useState, useRef, useCallback } from 'react';
import Modal from '../common/Modal';
import api   from '../../api/axios';

// ── CSV parser (no library needed) ───────────────────────────────────────────
function parseCSV(text) {
  const lines   = text.trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows    = lines.slice(1).map((line) => {
    const values = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"')      { inQ = !inQ; }
      else if (ch === ',' && !inQ) { values.push(cur.trim()); cur = ''; }
      else                 { cur += ch; }
    }
    values.push(cur.trim());

    return headers.reduce((obj, h, i) => {
      obj[h] = values[i] ?? '';
      return obj;
    }, {});
  });

  return { headers, rows };
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    idle:     'bg-gray-100  dark:bg-gray-800  text-gray-500  dark:text-gray-400',
    parsing:  'bg-blue-50   dark:bg-blue-950  text-blue-600  dark:text-blue-400',
    preview:  'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400',
    importing:'bg-amber-50  dark:bg-amber-950 text-amber-600 dark:text-amber-400',
    done:     'bg-green-50  dark:bg-green-950 text-green-600 dark:text-green-400',
    error:    'bg-red-50    dark:bg-red-950   text-red-600   dark:text-red-400',
  };
  const labels = {
    idle: 'Ready', parsing: 'Parsing…', preview: 'Preview',
    importing: 'Importing…', done: 'Done', error: 'Error',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BulkImportModal({ isOpen, onClose, onSuccess }) {
  const [status,   setStatus]   = useState('idle');
  const [rows,     setRows]     = useState([]);
  const [headers,  setHeaders]  = useState([]);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const reset = () => {
    setStatus('idle'); setRows([]); setHeaders([]);
    setResult(null);   setError('');
  };

  const handleClose = () => { reset(); onClose(); };

  // ── File processing ───────────────────────────────────────────────────────
  const processFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setError('Only .csv files are supported'); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('File too large — max 2 MB'); return;
    }

    setStatus('parsing'); setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const { headers, rows } = parseCSV(e.target.result);
      const requiredCols = ['name', 'category', 'price', 'baseStock'];
      const missing = requiredCols.filter((c) => !headers.includes(c));

      if (missing.length > 0) {
        setError(`Missing required columns: ${missing.join(', ')}`);
        setStatus('error');
        return;
      }

      if (rows.length === 0) {
        setError('File has no data rows'); setStatus('error'); return;
      }
      if (rows.length > 500) {
        setError('Maximum 500 rows allowed per import'); setStatus('error'); return;
      }

      setHeaders(headers);
      setRows(rows);
      setStatus('preview');
    };
    reader.onerror = () => { setError('Failed to read file'); setStatus('error'); };
    reader.readAsText(file);
  }, []);

  const handleFileInput = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  // ── Import ────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    setStatus('importing'); setError('');
    try {
      const { data } = await api.post('/import/products', { rows });
      setResult(data.data);
      setStatus('done');
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
      setStatus('error');
    }
  };

  // ── Download template ─────────────────────────────────────────────────────
  const downloadTemplate = async () => {
    const token = localStorage.getItem('token');
    const url   = `${import.meta.env.VITE_API_URL}/import/template`;
    const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const blob  = await res.blob();
    const link  = document.createElement('a');
    link.href   = URL.createObjectURL(blob);
    link.download = 'import-template.csv';
    link.click();
  };

  // ── Preview table cols to show ────────────────────────────────────────────
  const previewCols = ['name','category','price','baseStock','sku','unit'].filter(
    (c) => headers.includes(c)
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose}
           title="Bulk Import Products" size="lg">
      <div className="space-y-5">

        {/* Status + template download */}
        <div className="flex items-center justify-between">
          <StatusBadge status={status} />
          <button onClick={downloadTemplate}
            className="text-xs text-indigo-600 dark:text-indigo-400
                       hover:underline font-medium flex items-center gap-1">
            ⬇️ Download template
          </button>
        </div>

        {/* ── Idle / drop zone ────────────────────────────────────────── */}
        {(status === 'idle' || status === 'error') && (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center
                cursor-pointer transition
                ${dragOver
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600'
                }`}>
              <div className="text-4xl mb-3">📂</div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Drop your CSV file here
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                or click to browse — max 500 rows, 2 MB
              </p>
              <input ref={fileRef} type="file" accept=".csv"
                onChange={handleFileInput} className="hidden" />
            </div>

            {/* Required columns info */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Required columns
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['name','category','price','baseStock'].map((c) => (
                  <span key={c}
                    className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40
                               text-indigo-700 dark:text-indigo-300
                               rounded text-xs font-mono">
                    {c}
                  </span>
                ))}
                {['sku','unit','description','lowStockThreshold'].map((c) => (
                  <span key={c}
                    className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700
                               text-gray-600 dark:text-gray-400
                               rounded text-xs font-mono">
                    {c} (optional)
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Parsing spinner ──────────────────────────────────────────── */}
        {status === 'parsing' && (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500
                            border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Parsing file…</p>
          </div>
        )}

        {/* ── Preview table ────────────────────────────────────────────── */}
        {status === 'preview' && rows.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {rows.length} row{rows.length !== 1 ? 's' : ''} ready to import
              </p>
              <button onClick={reset}
                className="text-xs text-gray-400 dark:text-gray-500
                           hover:text-red-500 dark:hover:text-red-400 transition">
                ✕ Clear
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100
                            dark:border-gray-800 max-h-56">
              <table className="w-full text-xs">
                <thead className="sticky top-0">
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    {previewCols.map((c) => (
                      <th key={c}
                        className="px-3 py-2 text-left font-semibold text-gray-500
                                   dark:text-gray-400 uppercase tracking-wide
                                   whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {rows.slice(0, 10).map((row, i) => (
                    <tr key={i}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      {previewCols.map((c) => (
                        <td key={c}
                          className="px-3 py-2 text-gray-700 dark:text-gray-300
                                     whitespace-nowrap max-w-[120px] truncate">
                          {row[c] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 10 && (
                <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500
                              bg-white dark:bg-gray-900 border-t
                              border-gray-100 dark:border-gray-800">
                  … and {rows.length - 10} more rows
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Importing progress ───────────────────────────────────────── */}
        {status === 'importing' && (
          <div className="flex flex-col items-center py-10 gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500
                            border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Importing {rows.length} products…
            </p>
          </div>
        )}

        {/* ── Done result ──────────────────────────────────────────────── */}
        {status === 'done' && result && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Created', value: result.created, color: 'green'  },
                { label: 'Updated', value: result.updated, color: 'indigo' },
                { label: 'Skipped', value: result.skipped, color: 'amber'  },
              ].map(({ label, value, color }) => (
                <div key={label}
                  className={`bg-${color}-50 dark:bg-${color}-950/30
                    rounded-xl p-3 text-center`}>
                  <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>
                    {value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {result.errors?.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3
                              border border-amber-100 dark:border-amber-900/40
                              max-h-32 overflow-y-auto">
                <p className="text-xs font-semibold text-amber-700
                               dark:text-amber-400 mb-2">
                  Skipped rows
                </p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs text-amber-700 dark:text-amber-400">
                    • {e}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Error banner ─────────────────────────────────────────────── */}
        {error && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border
                          border-red-200 dark:border-red-800 rounded-xl
                          text-red-600 dark:text-red-400 text-sm whitespace-pre-line">
            ⚠️ {error}
          </div>
        )}

        {/* ── Action buttons ───────────────────────────────────────────── */}
        <div className="flex gap-3 pt-1">
          {status === 'done' ? (
            <button onClick={handleClose}
              className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700
                         text-white text-sm font-semibold transition">
              ✓ Done
            </button>
          ) : (
            <>
              <button onClick={handleClose}
                disabled={status === 'importing'}
                className="flex-1 py-3 rounded-xl border border-gray-200
                           dark:border-gray-700 text-sm font-medium
                           text-gray-600 dark:text-gray-300 transition
                           hover:bg-gray-50 dark:hover:bg-gray-800
                           disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleImport}
                disabled={status !== 'preview' || rows.length === 0}
                className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700
                           disabled:bg-indigo-300 dark:disabled:bg-indigo-900
                           text-white text-sm font-semibold transition
                           flex items-center justify-center gap-2 shadow-md">
                {status === 'importing' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white
                                     border-t-transparent rounded-full animate-spin" />
                    Importing…
                  </>
                ) : (
                  `⬆️ Import ${rows.length > 0 ? rows.length + ' rows' : ''}`
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </Modal>
  );
}