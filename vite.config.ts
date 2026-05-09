import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import istanbul from 'vite-plugin-istanbul';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@components': path.resolve(process.cwd(), 'src/components'),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.COVERAGE === 'true'
      ? [
          istanbul({
            exclude: ['node_modules', 'testing/**', 'src/**/*.spec.ts', 'src/**/*.server.ts'],
            include: 'src/**/*.{ts,tsx}',
          }),
        ]
      : []),
  ],
});
