import type { UpdateIssueRequest, UpdateIssueResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Update an issue via daemon
 */
export function daemonUpdateIssue(
  request: UpdateIssueRequest
): Promise<UpdateIssueResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.updateIssue.bind(client), request)
}
