import { callWithDeadline, getDaemonClient } from './load-proto.js'
import type { DuplicateItemRequest, DuplicateItemResponse } from './types.js'

/**
 * Duplicate an item of any type via daemon using the generic DuplicateItem RPC
 */
export function daemonDuplicateItem(
  request: DuplicateItemRequest
): Promise<DuplicateItemResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.duplicateItem.bind(client), request)
}
