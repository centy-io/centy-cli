import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/e2e/**/*.e2e.spec.ts'],
    globals: true,
    environment: 'node',
    // Higher timeout: tests spawn CLI subprocesses
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Run each file in isolation to avoid shared gRPC server state
    pool: 'forks',
    // Exclude from coverage (E2E tests are not subject to coverage thresholds)
    coverage: {
      enabled: false,
    },
  },
})
