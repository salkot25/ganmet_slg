import React from 'react';

/**
 * Reusable Badge component with 4px padding scale
 */
export function Badge({ variant = 'cyan', children, className = '' }) {
  const variantStyles = {
    cyan: 'bg-pln-cyan/15 text-pln-cyan-light border border-pln-cyan/30',
    yellow: 'bg-pln-yellow/15 text-pln-yellow border border-pln-yellow/30',
    orange: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    slate: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-4px text-xs font-semibold tracking-wide ${
        variantStyles[variant] || variantStyles.cyan
      } ${className}`}
    >
      {children}
    </span>
  );
}
