import type { UpdateDocRequest, UpdateDocResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Update a doc via daemon
 */
export function daemonUpdateDoc(
  request: UpdateDocRequest
): Promise<UpdateDocResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.updateDoc.bind(client), request)
}
