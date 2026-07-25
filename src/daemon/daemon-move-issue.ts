import type { MoveItemRequest, MoveItemResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Move an issue to a different project via daemon
 */
export function daemonMoveIssue(
  request: Omit<MoveItemRequest, 'itemType'>
): Promise<MoveItemResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.moveItem.bind(client), {
    ...request,
    itemType: 'issues',
  })
}
