import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import api   from '../api/axios';
import Layout from '../components/layout/Layout';

const ACTION_COLORS = {
  CREATE_PRODUCT:   { bg: 'bg-green-50  dark:bg-green-950/30',  text: 'text-green-700  dark:text-green-400',  dot: 'bg-green-500'  },
  UPDATE_PRODUCT:   { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
  DELETE_PRODUCT:   { bg: 'bg-red-50    dark:bg-red-950/30',    text: 'text-red-700    dark:text-red-400',    dot: 'bg-red-500'    },
  CREATE_CATEGORY:  { bg: 'bg-teal-50   dark:bg-teal-950/30',   text: 'text-teal-700   dark:text-teal-400',   dot: 'bg-teal-500'   },
  UPDATE_CATEGORY:  { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500' },
  DELETE_CATEGORY:  { bg: 'bg-red-50    dark:bg-red-950/30',    text: 'text-red-700    dark:text-red-400',    dot: 'bg-red-500'    },
  CREATE_STOCK_LOG: { bg: 'bg-blue-50   dark:bg-blue-950/30',   text: 'text-blue-700   dark:text-blue-400',   dot: 'bg-blue-500'   },
  UPDATE_STOCK_LOG: { bg: 'bg-amber-50  dark:bg-amber-950/30',  text: 'text-amber-700  dark:text-amber-400',  dot: 'bg-amber-500'  },
  DELETE_STOCK_LOG: { bg: 'bg-red-50    dark:bg-red-950/30',    text: 'text-red-700    dark:text-red-400',    dot: 'bg-red-500'    },
  BULK_IMPORT:      { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  LOGIN:            { bg: 'bg-gray-50   dark:bg-gray-800',      text: 'text-gray-600   dark:text-gray-400',   dot: 'bg-gray-400'   },
  EXPORT:           { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
};

const DEFAULT_COLOR = {
  bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400',
};

function ActionBadge({ action }) {
  const c     = ACTION_COLORS[action] || DEFAULT_COLOR;
  const label = action.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1
                      rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
      {label}
    </span>
  );
}

function ChangeDiff({ changes }) {
  if (!changes?.before && !changes?.after) return null;
  return (
    <div className="mt-2 text-xs">
      {changes.before && (
        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2 mb-1
                        font-mono text-red-700 dark:text-red-400 overflow-auto max-h-20">
          − {JSON.stringify(changes.before, null, 1)
              .replace(/[{}"]/g, '').trim().slice(0, 200)}
        </div>
      )}
      {changes.after && (
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg px-3 py-2
                        font-mono text-green-700 dark:text-green-400 overflow-auto max-h-20">
          + {JSON.stringify(changes.after, null, 1)
              .replace(/[{}"]/g, '').trim().slice(0, 200)}
        </div>
      )}
    </div>
  );
}

export default function AuditLogPage() {
  const [logs,      setLogs]      = useState([]);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const [page,      setPage]      = useState(1);
  const [action,    setAction]    = useState('');
  const [loading,   setLoading]   = useState(false);
  const [expanded,  setExpanded]  = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/audit', {
        params: { page, limit: 30, action: action || undefined },
      });
      setLogs(data.data); setTotal(data.total); setPages(data.pages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, action]);

  const toggleExpand = (id) =>
    setExpanded((prev) => (prev === id ? null : id));

  return (
    <Layout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Audit Log
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {total} event{total !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700
                       bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300
                       focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All actions</option>
            {Object.keys(ACTION_COLORS).map((a) => (
              <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Timeline */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800
                                      rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 dark:text-gray-400">No audit events found</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-px
                            bg-gray-200 dark:bg-gray-800" />

            <div className="space-y-3">
              {logs.map((log) => {
                const color = ACTION_COLORS[log.action] || DEFAULT_COLOR;
                const isExp = expanded === log._id;

                return (
                  <div key={log._id}
                    className="relative pl-12">

                    {/* Timeline dot */}
                    <div className={`absolute left-3.5 top-4 w-3 h-3 rounded-full
                                     border-2 border-white dark:border-gray-950
                                     ${color.dot}`} />

                    {/* Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border
                                    border-gray-100 dark:border-gray-800
                                    overflow-hidden transition hover:shadow-sm">
                      <button
                        onClick={() => toggleExpand(log._id)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left">

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <ActionBadge action={log.action} />
                            {log.entityName && (
                              <span className="text-xs font-medium text-gray-700
                                               dark:text-gray-300 truncate">
                                "{log.entityName}"
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs
                                          text-gray-400 dark:text-gray-500">
                            <span>👤 {log.username || log.user?.username || 'System'}</span>
                            <span>🕒 {dayjs(log.createdAt).format('DD MMM, h:mm A')}</span>
                            {log.ip && <span>🌐 {log.ip}</span>}
                          </div>
                        </div>

                        <span className={`text-gray-400 transition-transform text-xs mt-1
                          ${isExp ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>

                      {/* Expanded detail */}
                      {isExp && (
                        <div className="px-4 pb-4 border-t border-gray-50
                                        dark:border-gray-800 pt-3">
                          {log.meta && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl
                                            px-3 py-2 mb-2">
                              <p className="text-xs font-semibold text-gray-500
                                            dark:text-gray-400 mb-1">Metadata</p>
                              <pre className="text-xs text-gray-700 dark:text-gray-300
                                              font-mono whitespace-pre-wrap">
                                {JSON.stringify(log.meta, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.changes && <ChangeDiff changes={log.changes} />}
                          {log.entityId && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 font-mono">
                              ID: {log.entityId}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700
                         text-sm font-medium text-gray-600 dark:text-gray-300
                         disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              ‹
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
              {page} / {pages}
            </span>
            <button onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700
                         text-sm font-medium text-gray-600 dark:text-gray-300
                         disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              ›
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}