import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2, drop_console: true }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['solid-js', '@solidjs/router']
        }
      }
    }
  },
  server: { port: 3000, host: '0.0.0.0' }
});
