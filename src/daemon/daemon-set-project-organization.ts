import type {
  SetProjectOrganizationRequest,
  SetProjectOrganizationResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Set project organization assignment via daemon
 */
export function daemonSetProjectOrganization(
  request: SetProjectOrganizationRequest
): Promise<SetProjectOrganizationResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.setProjectOrganization.bind(client), request)
}
