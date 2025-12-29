import type { MoveIssueRequest, MoveIssueResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Move an issue to a different project via daemon
 */
export function daemonMoveIssue(
  request: MoveIssueRequest
): Promise<MoveIssueResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.moveIssue.bind(client), request)
}
