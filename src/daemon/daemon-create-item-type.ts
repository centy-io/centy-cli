import type { CreateItemTypeRequest, CreateItemTypeResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Create a custom item type via daemon
 */
export function daemonCreateItemType(
  request: CreateItemTypeRequest
): Promise<CreateItemTypeResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.createItemType.bind(client), request)
}
