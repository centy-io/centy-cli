import { callWithDeadline, getDaemonClient } from './load-proto.js'
import type { MoveItemRequest, MoveItemResponse } from './types.js'

/**
 * Move an item of any type to another project via daemon using the generic MoveItem RPC
 */
export function daemonMoveItem(
  request: MoveItemRequest
): Promise<MoveItemResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.moveItem.bind(client), request)
}
