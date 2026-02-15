import type {
  GetAvailableLinkTypesRequest,
  GetAvailableLinkTypesResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get all available link types (builtin + custom) via daemon
 */
export function daemonGetAvailableLinkTypes(
  request: GetAvailableLinkTypesRequest
): Promise<GetAvailableLinkTypesResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getAvailableLinkTypes.bind(client), request)
}
