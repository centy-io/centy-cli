import type { GetItemRequest, GetItemResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get an item via daemon using the generic GetItem RPC
 */
export function daemonGetItem(
  request: GetItemRequest
): Promise<GetItemResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getItem.bind(client), request)
}
