import type { RestartRequest, RestartResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Restart the daemon
 */
export function daemonRestart(
  request: RestartRequest
): Promise<RestartResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().restart(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
