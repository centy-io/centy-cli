import type { ListLinksRequest, ListLinksResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List all links for an entity via daemon
 */
export function daemonListLinks(
  request: ListLinksRequest
): Promise<ListLinksResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listLinks.bind(client), request)
}
