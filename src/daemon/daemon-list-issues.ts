import type { ListItemsRequest, ListItemsResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List issues via daemon
 */
export function daemonListIssues(
  request: Omit<ListItemsRequest, 'itemType'>
): Promise<ListItemsResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listItems.bind(client), {
    ...request,
    itemType: 'issues',
  })
}
