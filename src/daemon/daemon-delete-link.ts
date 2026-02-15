import type { DeleteLinkRequest, DeleteLinkResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Delete a link between two entities via daemon
 */
export function daemonDeleteLink(
  request: DeleteLinkRequest
): Promise<DeleteLinkResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.deleteLink.bind(client), request)
}
