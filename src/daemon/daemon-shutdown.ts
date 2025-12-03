import type { ShutdownRequest, ShutdownResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Shutdown the daemon gracefully
 */
export function daemonShutdown(
  request: ShutdownRequest
): Promise<ShutdownResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().shutdown(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
