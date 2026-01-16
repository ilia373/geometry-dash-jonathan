import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        'vite.config.ts',
        'vitest.config.ts',
        'eslint.config.js',
        'dist/**',
        'src/main.tsx', // Entry point
        'src/App.tsx', // Root component with routing
        'src/components/Game.tsx', // Complex canvas game loop
        'src/utils/gameRenderer.ts', // Canvas rendering
        'src/utils/soundManager.ts', // Audio API
        // Firebase SDK initialization (external service)
        'src/config/firebase.ts',
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 70,
          lines: 85,
          statements: 85,
        },
      },
    },
  },
});
