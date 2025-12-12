import type {
  GetOrganizationRequest,
  GetOrganizationResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get a single organization by slug via daemon
 */
export function daemonGetOrganization(
  request: GetOrganizationRequest
): Promise<GetOrganizationResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getOrganization(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
