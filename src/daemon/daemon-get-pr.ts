import type { GetPrRequest, PullRequest } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get a PR by ID via daemon
 */
export function daemonGetPr(request: GetPrRequest): Promise<PullRequest> {
  const client = getDaemonClient()
  return callWithDeadline(client.getPr.bind(client), request)
}
