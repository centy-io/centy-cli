import type { GetOrgConfigRequest, OrgConfig } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get organization config via daemon
 */
export function daemonGetOrgConfig(
  request: GetOrgConfigRequest
): Promise<OrgConfig> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getOrgConfig(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
