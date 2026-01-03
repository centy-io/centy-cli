import type { UpdatePrRequest, UpdatePrResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Update a PR via daemon
 */
export function daemonUpdatePr(
  request: UpdatePrRequest
): Promise<UpdatePrResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.updatePr.bind(client), request)
}
