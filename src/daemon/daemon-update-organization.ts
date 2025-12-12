import type {
  UpdateOrganizationRequest,
  UpdateOrganizationResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Update an existing organization via daemon
 */
export function daemonUpdateOrganization(
  request: UpdateOrganizationRequest
): Promise<UpdateOrganizationResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().updateOrganization(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
