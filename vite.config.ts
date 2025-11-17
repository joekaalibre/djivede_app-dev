// 📁 vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      context: path.resolve(__dirname, './src/context'),
      components: path.resolve(__dirname, './src/ui/components'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4242',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
