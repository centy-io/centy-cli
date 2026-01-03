import type { ListPrsRequest, ListPrsResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List PRs via daemon
 */
export function daemonListPrs(
  request: ListPrsRequest
): Promise<ListPrsResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listPrs.bind(client), request)
}
