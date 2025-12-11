import type { GetPrsByUuidRequest, GetPrsByUuidResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Search for PRs by UUID across all tracked projects
 */
export function daemonGetPrsByUuid(
  request: GetPrsByUuidRequest
): Promise<GetPrsByUuidResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getPrsByUuid(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
