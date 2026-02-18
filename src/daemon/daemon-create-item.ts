import type { CreateItemRequest, CreateItemResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Create a generic item via daemon
 */
export function daemonCreateItem(
  request: CreateItemRequest
): Promise<CreateItemResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.createItem.bind(client), request)
}
