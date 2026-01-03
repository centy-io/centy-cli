import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.config.ts',
        'coverage/',
        'src/lib/autostart/**',
        'src/lib/install-daemon/**',
        'src/lib/start/**',
        'src/daemon/**',
        'src/flags/**',
        'src/lib/create-pr/**',
        'src/types/**',
        'src/index.ts',
      ],
      thresholds: {
        // Temporarily lowered from 80% - see issue for improvement plan
        lines: 40,
        functions: 45,
        branches: 25,
        statements: 40,
      },
    },
  },
})
