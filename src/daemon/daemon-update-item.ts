import { callWithDeadline, getDaemonClient } from './load-proto.js'
import type { UpdateItemRequest, UpdateItemResponse } from './types.js'

/**
 * Update an item of any type via daemon using the generic UpdateItem RPC
 */
export function daemonUpdateItem(
  request: UpdateItemRequest
): Promise<UpdateItemResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.updateItem.bind(client), request)
}
