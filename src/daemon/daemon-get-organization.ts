import type {
  GetOrganizationRequest,
  GetOrganizationResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get a single organization by slug via daemon
 */
export function daemonGetOrganization(
  request: GetOrganizationRequest
): Promise<GetOrganizationResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getOrganization.bind(client), request)
}
