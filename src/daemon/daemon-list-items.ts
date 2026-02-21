import { callWithDeadline, getDaemonClient } from './load-proto.js'
import type { ListItemsRequest, ListItemsResponse } from './types.js'

/**
 * List items of any type via daemon using the generic ListItems RPC
 */
export function daemonListItems(
  request: ListItemsRequest
): Promise<ListItemsResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listItems.bind(client), request)
}
