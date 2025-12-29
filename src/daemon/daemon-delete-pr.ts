import type { DeletePrRequest, DeletePrResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Delete a PR via daemon
 */
export function daemonDeletePr(
  request: DeletePrRequest
): Promise<DeletePrResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.deletePr.bind(client), request)
}
