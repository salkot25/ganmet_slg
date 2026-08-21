import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ganmet_slg/', // Exact repo path for GitHub Pages
  server: {
    port: 3000,
    open: false
  }
});
