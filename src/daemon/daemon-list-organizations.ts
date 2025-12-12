import type {
  ListOrganizationsRequest,
  ListOrganizationsResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * List all organizations via daemon
 */
export function daemonListOrganizations(
  request: ListOrganizationsRequest
): Promise<ListOrganizationsResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().listOrganizations(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
