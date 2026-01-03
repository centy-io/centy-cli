import type { MoveDocRequest, MoveDocResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Move a doc to a different project via daemon
 */
export function daemonMoveDoc(
  request: MoveDocRequest
): Promise<MoveDocResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.moveDoc.bind(client), request)
}
