import type {
  GetSupportedEditorsRequest,
  GetSupportedEditorsResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get supported editors from the daemon
 */
export function daemonGetSupportedEditors(
  request: GetSupportedEditorsRequest
): Promise<GetSupportedEditorsResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getSupportedEditors.bind(client), request)
}
