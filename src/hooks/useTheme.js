import { useState, useEffect } from 'react';

/**
 * Custom hook for Dark / Light theme management
 */
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('pln_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      document.body.className = 'bg-base-dark text-slate-100 antialiased selection:bg-pln-cyan selection:text-white min-h-screen';
      localStorage.setItem('pln_theme', 'dark');
    } else {
      root.classList.remove('dark');
      document.body.className = 'bg-base-light text-slate-900 antialiased selection:bg-pln-cyan selection:text-white min-h-screen';
      localStorage.setItem('pln_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return { isDark, toggleTheme };
}
