/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 60% Dominant Base
        base: {
          dark: '#070F1E',
          'dark-subtle': '#0B1728',
          light: '#F8FAFC',
          'light-subtle': '#F1F5F9',
        },
        // 30% Secondary Structure & Cards
        surface: {
          dark: '#102238',
          'dark-hover': '#162B45',
          'dark-border': '#1E3A5F',
          light: '#FFFFFF',
          'light-hover': '#F8FAFC',
          'light-border': '#E2E8F0',
        },
        // 10% PLN Brand Accents
        pln: {
          cyan: '#00A2B9',
          'cyan-light': '#00C2CB',
          'cyan-dark': '#00838F',
          'cyan-glow': 'rgba(0, 162, 185, 0.35)',
          'cyan-subtle': 'rgba(0, 162, 185, 0.12)',
          yellow: '#FFC107',
          'yellow-light': '#FFD54F',
          'yellow-glow': 'rgba(255, 193, 7, 0.3)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'card-light': '0 4px 16px -2px rgba(15, 23, 42, 0.06), 0 0 0 1px rgba(15, 23, 42, 0.05)',
        'glow-cyan': '0 0 20px -2px rgba(0, 162, 185, 0.4)',
        'glow-yellow': '0 0 15px -2px rgba(255, 193, 7, 0.35)',
      },
      borderRadius: {
        '4px': '4px',
        '8px': '8px',
        '12px': '12px',
        '16px': '16px',
        '20px': '20px',
      }
    },
  },
  plugins: [],
}
