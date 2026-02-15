import type { CreateLinkRequest, CreateLinkResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Create a link between two entities via daemon
 */
export function daemonCreateLink(
  request: CreateLinkRequest
): Promise<CreateLinkResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.createLink.bind(client), request)
}
