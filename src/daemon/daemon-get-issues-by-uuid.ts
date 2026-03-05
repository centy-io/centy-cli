import type { SearchItemsResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Search for issues by UUID across all tracked projects
 */
export function daemonGetIssuesByUuid(request: {
  uuid: string
}): Promise<SearchItemsResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.searchItems.bind(client), {
    itemType: 'issues',
    itemId: request.uuid,
  })
}
