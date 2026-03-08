// ============================================================
// TabibPro — Vitest config — Web (Next.js 15)
// Tests unitaires composants React
// ============================================================

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.tsx', 'src/**/*.spec.ts', 'src/**/*.test.tsx', 'src/**/*.test.ts'],
    exclude: ['node_modules', '.next', 'e2e'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.spec.*', 'src/app/layout.tsx'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
