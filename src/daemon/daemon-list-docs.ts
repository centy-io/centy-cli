import type { ListDocsRequest, ListDocsResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List docs via daemon
 */
export function daemonListDocs(
  request: ListDocsRequest
): Promise<ListDocsResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listDocs.bind(client), request)
}
