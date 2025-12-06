import type { UpdateCompactRequest, UpdateCompactResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Update compact.md content via daemon
 */
export function daemonUpdateCompact(
  request: UpdateCompactRequest
): Promise<UpdateCompactResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().updateCompact(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
