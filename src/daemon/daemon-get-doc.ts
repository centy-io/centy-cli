import type { GetDocRequest, Doc } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get a doc by slug via daemon
 */
export function daemonGetDoc(request: GetDocRequest): Promise<Doc> {
  const client = getDaemonClient()
  return callWithDeadline(client.getDoc.bind(client), request)
}
