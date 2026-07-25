import type { UpdateItemRequest, UpdateItemResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Update an issue via daemon
 */
export function daemonUpdateIssue(
  request: Omit<UpdateItemRequest, 'itemType'>
): Promise<UpdateItemResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.updateItem.bind(client), {
    ...request,
    itemType: 'issues',
  })
}
