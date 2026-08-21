import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Reusable Modal component with blur backdrop and 4px padding scale
 */
export function Modal({ isOpen, onClose, title, icon: Icon, children, maxWidth = 'max-w-2xl' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} max-h-[90vh] flex flex-col bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border rounded-20px shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-light-border dark:border-surface-dark-border bg-base-light dark:bg-base-dark/50">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-5 h-5 text-pln-cyan" />}
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-6px text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
