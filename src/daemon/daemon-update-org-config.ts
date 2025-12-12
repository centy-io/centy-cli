import type {
  UpdateOrgConfigRequest,
  UpdateOrgConfigResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Update organization config via daemon
 */
export function daemonUpdateOrgConfig(
  request: UpdateOrgConfigRequest
): Promise<UpdateOrgConfigResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().updateOrgConfig(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
