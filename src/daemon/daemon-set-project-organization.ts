import type {
  SetProjectOrganizationRequest,
  SetProjectOrganizationResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Set project organization assignment via daemon
 */
export function daemonSetProjectOrganization(
  request: SetProjectOrganizationRequest
): Promise<SetProjectOrganizationResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().setProjectOrganization(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
