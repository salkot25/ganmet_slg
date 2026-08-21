import React from 'react';

/**
 * Reusable Button component with 4px grid rules
 */
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  icon: Icon,
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-8px transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none gap-2 font-sans';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    icon: 'p-2 w-9 h-9',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-pln-cyan to-pln-cyan-dark text-white shadow-sm hover:shadow-glow-cyan hover:brightness-105 border border-pln-cyan/40',
    secondary:
      'bg-surface-light dark:bg-surface-dark text-slate-700 dark:text-slate-200 border border-surface-light-border dark:border-surface-dark-border hover:bg-surface-light-hover dark:hover:bg-surface-dark-hover hover:border-pln-cyan/50',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-400 hover:text-pln-cyan dark:hover:text-pln-cyan-light hover:bg-pln-cyan/10',
    outline:
      'bg-transparent text-pln-cyan-light border border-pln-cyan/40 hover:bg-pln-cyan/10',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
}
