import type { ServiceError } from '@grpc/grpc-js'
import {
  getDaemonClient,
  callWithDeadline,
  isDeadlineExceededError,
  isDaemonUnavailableError,
} from './load-proto.js'

/**
 * Timeout for connection check (5 seconds - should be quick)
 */
const CONNECTION_CHECK_TIMEOUT_MS = 5000

export interface DaemonConnectionStatus {
  connected: boolean
  error?: string
}

function isServiceError(error: unknown): error is ServiceError {
  return error instanceof Error && 'code' in error
}

/**
 * Check if daemon is running and accessible
 * Uses getDaemonInfo as a lightweight health check with a proper deadline
 */
export async function checkDaemonConnection(): Promise<DaemonConnectionStatus> {
  try {
    const client = getDaemonClient()
    const response = await callWithDeadline(
      client.getDaemonInfo.bind(client),
      {},
      CONNECTION_CHECK_TIMEOUT_MS
    )

    if (response) {
      return { connected: true }
    }
    return {
      connected: false,
      error: 'No response from daemon',
    }
  } catch (error) {
    if (isServiceError(error)) {
      if (isDeadlineExceededError(error)) {
        return {
          connected: false,
          error: 'Connection timeout - daemon may not be running',
        }
      }

      if (isDaemonUnavailableError(error)) {
        return {
          connected: false,
          error: 'Centy daemon is not running. Please start the daemon first.',
        }
      }

      return {
        connected: false,
        error: `Daemon connection error: ${error.message}`,
      }
    }

    return {
      connected: false,
      error: `Daemon connection error: ${String(error)}`,
    }
  }
}
