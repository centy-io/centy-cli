import type { GenericItem, GetItemRequest } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'
import { DaemonResponseError } from './daemon-response-error.js'

/**
 * Get a single issue by ID via daemon
 */
export async function daemonGetIssue(
  request: Omit<GetItemRequest, 'itemType'>
): Promise<GenericItem> {
  const client = getDaemonClient()
  const response = await callWithDeadline(client.getItem.bind(client), {
    ...request,
    itemType: 'issues',
  })
  if (!response.item) {
    throw new DaemonResponseError(response.error || 'Issue not found')
  }
  return response.item
}
