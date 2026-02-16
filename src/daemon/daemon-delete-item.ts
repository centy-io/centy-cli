import type { DeleteItemRequest, DeleteItemResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Delete an item via daemon using the generic DeleteItem RPC
 */
export function daemonDeleteItem(
  request: DeleteItemRequest
): Promise<DeleteItemResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.deleteItem.bind(client), request)
}
