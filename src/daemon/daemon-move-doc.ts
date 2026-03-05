import type { MoveItemRequest, MoveItemResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Move a doc to a different project via daemon
 */
export function daemonMoveDoc(
  request: Omit<MoveItemRequest, 'itemType'>
): Promise<MoveItemResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.moveItem.bind(client), {
    ...request,
    itemType: 'docs',
  })
}
