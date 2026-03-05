import type { GenericItem, GetItemRequest } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'
import { DaemonResponseError } from './daemon-response-error.js'

/**
 * Get a doc by slug via daemon
 */
export async function daemonGetDoc(
  request: Omit<GetItemRequest, 'itemType'>
): Promise<GenericItem> {
  const client = getDaemonClient()
  const response = await callWithDeadline(client.getItem.bind(client), {
    ...request,
    itemType: 'docs',
  })
  if (!response.item) {
    throw new DaemonResponseError(response.error || 'Doc not found')
  }
  return response.item
}
