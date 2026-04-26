import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import istanbul from 'vite-plugin-istanbul';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
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
