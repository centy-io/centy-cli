import { callWithDeadline, getDaemonClient } from './load-proto.js'
import type { ListItemTypesRequest, ListItemTypesResponse } from './types.js'

/**
 * List all item types for a project via daemon using the ListItemTypes RPC
 */
export function daemonListItemTypes(
  request: ListItemTypesRequest
): Promise<ListItemTypesResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listItemTypes.bind(client), request)
}
