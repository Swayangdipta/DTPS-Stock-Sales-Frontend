import { useState, useEffect } from 'react';

export default function PWAInstallBanner() {
  const [prompt,   setPrompt]   = useState(null);
  const [visible,  setVisible]  = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setVisible(false);
    setPrompt(null);
  };

  if (!visible || installed) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto
                    md:right-6 md:w-80 z-50
                    bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border
                    border-gray-100 dark:border-gray-800 p-4
                    flex items-center gap-3 animate-slide-up">
      {/* App icon */}
      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center
                      justify-center text-white text-xl font-bold shrink-0">
        S
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Install StockSales
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Add to home screen for quick access
        </p>
      </div>

      <div className="flex flex-col gap-1.5 shrink-0">
        <button onClick={handleInstall}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700
                     text-white text-xs font-semibold rounded-lg transition">
          Install
        </button>
        <button onClick={() => setVisible(false)}
          className="px-3 py-1.5 text-gray-400 text-xs hover:text-gray-600
                     dark:hover:text-gray-300 transition text-center">
          Not now
        </button>
      </div>
    </div>
  );
}