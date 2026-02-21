import { callWithDeadline, getDaemonClient } from './load-proto.js'
import type { RestoreItemRequest, RestoreItemResponse } from './types.js'

/**
 * Restore a soft-deleted item of any type via daemon using the generic RestoreItem RPC
 */
export function daemonRestoreItem(
  request: RestoreItemRequest
): Promise<RestoreItemResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.restoreItem.bind(client), request)
}
