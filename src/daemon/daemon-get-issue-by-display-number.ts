import type { GetIssueByDisplayNumberRequest, Issue } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get a single issue by display number via daemon
 */
export function daemonGetIssueByDisplayNumber(
  request: GetIssueByDisplayNumberRequest
): Promise<Issue> {
  const client = getDaemonClient()
  return callWithDeadline(client.getIssueByDisplayNumber.bind(client), request)
}
