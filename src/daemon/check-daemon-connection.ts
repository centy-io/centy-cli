/* eslint-disable single-export/single-export */
/* eslint-disable no-restricted-syntax */

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
    const grpcError = error as ServiceError

    if (isDeadlineExceededError(grpcError)) {
      return {
        connected: false,
        error: 'Connection timeout - daemon may not be running',
      }
    }

    if (isDaemonUnavailableError(grpcError)) {
      return {
        connected: false,
        error: 'Centy daemon is not running. Please start the daemon first.',
      }
    }

    const msg = grpcError.message ?? String(error)
    return {
      connected: false,
      error: `Daemon connection error: ${msg}`,
    }
  }
}
