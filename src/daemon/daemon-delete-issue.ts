import type { DeleteIssueRequest, DeleteIssueResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Delete an issue via daemon
 */
export function daemonDeleteIssue(
  request: DeleteIssueRequest
): Promise<DeleteIssueResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.deleteIssue.bind(client), request)
}
