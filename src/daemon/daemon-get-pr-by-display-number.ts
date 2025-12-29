import type { GetPrByDisplayNumberRequest, PullRequest } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get a PR by display number via daemon
 */
export function daemonGetPrByDisplayNumber(
  request: GetPrByDisplayNumberRequest
): Promise<PullRequest> {
  const client = getDaemonClient()
  return callWithDeadline(client.getPrByDisplayNumber.bind(client), request)
}
