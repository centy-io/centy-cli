/* eslint-disable single-export/single-export */

import type {
  ShutdownRequest,
  ShutdownResponse,
  RestartRequest,
  RestartResponse,
} from './types.js'
import { daemonShutdown } from './daemon-shutdown.js'
import { daemonRestart } from './daemon-restart.js'

export interface DaemonControlResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Service for daemon control operations (shutdown/restart).
 * Handles the CANCELLED gRPC error that occurs when the daemon
 * terminates before it can send a response - this is expected
 * successful behavior for these operations.
 */
export class DaemonControlService {
  async shutdown(
    request?: ShutdownRequest
  ): Promise<DaemonControlResult<ShutdownResponse>> {
    // eslint-disable-next-line no-restricted-syntax
    const req = request ?? { delaySeconds: 0 }
    try {
      const response = await daemonShutdown(req)
      return { success: true, data: response }
    } catch (error) {
      return this.handleError(error, 'shutdown')
    }
  }

  async restart(
    request?: RestartRequest
  ): Promise<DaemonControlResult<RestartResponse>> {
    // eslint-disable-next-line no-restricted-syntax
    const req = request ?? { delaySeconds: 0 }
    try {
      const response = await daemonRestart(req)
      return { success: true, data: response }
    } catch (error) {
      return this.handleError(error, 'restart')
    }
  }

  private handleError(
    error: unknown,
    operation: 'shutdown' | 'restart'
  ): DaemonControlResult<ShutdownResponse | RestartResponse> {
    const msg = error instanceof Error ? error.message : String(error)

    // CANCELLED error means daemon shut down before responding - this is success
    if (msg.includes('CANCELLED')) {
      return {
        success: true,
        data: {
          success: true,
          message: `Daemon ${operation} initiated`,
        },
      }
    }

    // Daemon not running
    if (msg.includes('UNAVAILABLE') || msg.includes('ECONNREFUSED')) {
      return {
        success: false,
        error: 'Centy daemon is not running. Please start the daemon first.',
      }
    }

    return {
      success: false,
      error: msg || `Failed to ${operation} daemon`,
    }
  }
}

export const daemonControlService = new DaemonControlService()
