import React from 'react';

/**
 * Reusable Card component adhering to 30% secondary structure & 4px spatial grid
 */
export function Card({ children, className = '', glow = false, ...props }) {
  return (
    <div
      className={`bg-surface-light dark:bg-surface-dark border border-surface-light-border dark:border-surface-dark-border rounded-16px p-5 md:p-6 shadow-card-light dark:shadow-card-dark transition-all duration-200 ${
        glow ? 'border-pln-cyan/40 shadow-glow-cyan' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
