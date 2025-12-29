import type {
  DeleteOrganizationRequest,
  DeleteOrganizationResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Delete an organization via daemon
 */
export function daemonDeleteOrganization(
  request: DeleteOrganizationRequest
): Promise<DeleteOrganizationResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.deleteOrganization.bind(client), request)
}
