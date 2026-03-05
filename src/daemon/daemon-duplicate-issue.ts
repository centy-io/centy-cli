import type { DuplicateItemRequest, DuplicateItemResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Duplicate an issue (same or different project) via daemon
 */
export function daemonDuplicateIssue(
  request: Omit<DuplicateItemRequest, 'itemType'>
): Promise<DuplicateItemResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.duplicateItem.bind(client), {
    ...request,
    itemType: 'issues',
  })
}
