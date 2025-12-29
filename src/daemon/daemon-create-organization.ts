import type {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Create a new organization via daemon
 */
export function daemonCreateOrganization(
  request: CreateOrganizationRequest
): Promise<CreateOrganizationResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.createOrganization.bind(client), request)
}
