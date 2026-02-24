/**
 * Default mock gRPC handlers for E2E tests.
 * These cover the prerun hook requirements (getDaemonInfo, getManifest)
 * that run before every command.
 */
import type { MockHandlers } from './mock-grpc-server.js'

/**
 * Base handlers required by the prerun hook.
 * Every E2E test's mock server should include these.
 */
export const BASE_HANDLERS: MockHandlers = {
  /** Health check used by checkDaemonConnection() in the prerun hook */
  getDaemonInfo: () => ({
    version: '0.7.7',
    binaryPath: '/usr/local/bin/centy-daemon',
    vscodeAvailable: false,
  }),
  /** Version check used by getProjectVersionStatus() in the prerun hook */
  getManifest: () => ({
    success: true,
    error: '',
    manifest: {
      schemaVersion: 1,
      centyVersion: '0.7.7',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  }),
}
