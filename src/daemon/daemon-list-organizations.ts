import type {
  ListOrganizationsRequest,
  ListOrganizationsResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List all organizations via daemon
 */
export function daemonListOrganizations(
  request: ListOrganizationsRequest
): Promise<ListOrganizationsResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listOrganizations.bind(client), request)
}
