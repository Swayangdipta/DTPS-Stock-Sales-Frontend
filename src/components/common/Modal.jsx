import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center
                    justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
           onClick={onClose} />

      {/* Sheet (mobile) / Dialog (desktop) */}
      <div className={`relative w-full ${sizes[size]} bg-white dark:bg-gray-900
                       rounded-t-3xl sm:rounded-2xl shadow-2xl z-10
                       max-h-[90vh] flex flex-col animate-slide-up`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
                        border-b border-gray-100 dark:border-gray-800 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       bg-gray-100 dark:bg-gray-800 text-gray-500
                       hover:bg-gray-200 dark:hover:bg-gray-700 transition text-lg">
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
}