import type { AssignIssueRequest, AssignIssueResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Assign users to an issue via daemon
 */
export function daemonAssignIssue(
  request: AssignIssueRequest
): Promise<AssignIssueResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.assignIssue.bind(client), request)
}
