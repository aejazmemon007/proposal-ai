import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Vite Configuration for Development & Production
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      port: parseInt(process.env.PORT || '8443'),
      strictPort: false,
    },
    preview: {
      host: true,
      port: parseInt(process.env.PORT || '8443'),
      strictPort: false,
    },
    build: {
      target: 'esnext',
      sourcemap: isDev,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('recharts')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              return 'vendor-core';
            }
          },
        },
      },
    },
  };
});
