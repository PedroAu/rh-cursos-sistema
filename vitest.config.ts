import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage/unit',
      // REC-404: baseline real medido em 2026-07-16 (ver docs/history/reports/
      // rec-404-cobertura-real-2026-07-16.md). Ratchet: não pode cair abaixo
      // do baseline registrado; não é uma meta de qualidade arbitrária.
      thresholds: {
        statements: 47,
        branches: 39,
        functions: 44,
        lines: 48,
      },
      // Cobertura medida sobre o código elegível real do projeto (src/**),
      // excluindo apenas artefatos gerados, tipos e configuração — não mais
      // restrita a uma allowlist manual de arquivos (FND-15, REC-404).
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        '**/*.stories.tsx',
        'src/lib/supabase/database.types.ts',
        'src/design-tokens/**',
        'src/types/**',
        'src/graphify-out/**',
        '**/*.d.ts',
      ],
    },
    include: ['src/__tests__/**/*.test.ts', 'src/__tests__/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
