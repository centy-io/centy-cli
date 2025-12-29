import type { UnassignIssueRequest, UnassignIssueResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Unassign users from an issue via daemon
 */
export function daemonUnassignIssue(
  request: UnassignIssueRequest
): Promise<UnassignIssueResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.unassignIssue.bind(client), request)
}
