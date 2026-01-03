import type { DeleteDocRequest, DeleteDocResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Delete a doc via daemon
 */
export function daemonDeleteDoc(
  request: DeleteDocRequest
): Promise<DeleteDocResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.deleteDoc.bind(client), request)
}
