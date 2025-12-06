import type {
  GetFeatureStatusRequest,
  GetFeatureStatusResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get feature status via daemon
 */
export function daemonGetFeatureStatus(
  request: GetFeatureStatusRequest
): Promise<GetFeatureStatusResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getFeatureStatus(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
