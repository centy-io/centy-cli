import type {
  DeleteOrganizationRequest,
  DeleteOrganizationResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Delete an organization via daemon
 */
export function daemonDeleteOrganization(
  request: DeleteOrganizationRequest
): Promise<DeleteOrganizationResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().deleteOrganization(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
