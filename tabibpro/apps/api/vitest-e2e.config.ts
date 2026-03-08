// ============================================================
// TabibPro — Vitest config E2E — API (NestJS)
// Tests d'intégration avec base de données de test
// ============================================================

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts', 'test/**/*.e2e.ts'],
    exclude: ['node_modules', 'dist'],
    // Tests E2E séquentiels (une seule DB de test)
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
    // Timeout plus long pour les appels API réels
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Fichier de setup global (connexion DB de test)
    globalSetup: './test/global-setup.ts',
    setupFiles: ['./test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
