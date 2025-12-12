import type {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Create a new organization via daemon
 */
export function daemonCreateOrganization(
  request: CreateOrganizationRequest
): Promise<CreateOrganizationResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().createOrganization(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
