import type { GetCompactRequest, GetCompactResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get compact.md content via daemon
 */
export function daemonGetCompact(
  request: GetCompactRequest
): Promise<GetCompactResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getCompact(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
