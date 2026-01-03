import type {
  UpdateOrganizationRequest,
  UpdateOrganizationResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Update an existing organization via daemon
 */
export function daemonUpdateOrganization(
  request: UpdateOrganizationRequest
): Promise<UpdateOrganizationResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.updateOrganization.bind(client), request)
}
