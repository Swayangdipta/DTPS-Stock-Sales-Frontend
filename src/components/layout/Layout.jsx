import { useAuth }  from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import ExportModal from '../export/ExportModal';
import { useState } from 'react';

const NAV = [
  { path: '/',           icon: '📊', label: 'Dashboard'  },
  { path: '/products',   icon: '📦', label: 'Products'   },
  { path: '/categories', icon: '🗂️',  label: 'Categories' },
  { path: '/stock',      icon: '✏️',  label: 'Entry'      },
  { path: '/calendar',   icon: '📅', label: 'Calendar'   },
  { path: '/analytics',  icon: '📈', label: 'Analytics'  },
  { path: '/audit', icon: '🕒', label: 'Audit' },
];

export default function Layout({ children }) {
  const { logout }    = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { pathname }  = useLocation();
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b
                         border-gray-100 dark:border-gray-800 px-4 h-14
                         flex items-center justify-between shadow-sm">
        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
          StockSales
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => setExportOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                      bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600
                      dark:text-indigo-400 text-sm font-medium
                      hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
            ⬇️ Export
          </button>
          <button onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800
                       text-gray-600 dark:text-gray-300 text-sm">
            {isDark ? '☀️' : '🌙'}
          </button>
          <button onClick={logout}
            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800
                       text-gray-600 dark:text-gray-300 text-sm font-medium
                       hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500
                       transition">
            Logout
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-20 md:pb-6">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-gray-900
                      border-t border-gray-100 dark:border-gray-800
                      flex md:hidden safe-area-bottom">
        {NAV.map(({ path, icon, label }) => {
          const active = pathname === path;
          return (
            <Link key={path} to={path}
              className={`flex-1 flex flex-col items-center justify-center
                          py-2 gap-0.5 transition
                          ${active
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-400 dark:text-gray-600'
                          }`}>
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Export Modal */}
      <ExportModal isOpen={exportOpen} onClose={() => setExportOpen(false)} />

      {/* Floating export button — mobile only */}
      <button onClick={() => setExportOpen(true)}
        className="fixed bottom-20 right-4 z-30 md:hidden
                  w-12 h-12 bg-indigo-600 hover:bg-indigo-700
                  text-white rounded-2xl shadow-xl flex items-center
                  justify-center text-xl transition active:scale-95">
        ⬇️
      </button>
    </div>
  );
}