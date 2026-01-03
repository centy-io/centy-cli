import type { DeleteOrgIssueRequest, DeleteOrgIssueResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Delete an organization issue via daemon
 */
export function daemonDeleteOrgIssue(
  request: DeleteOrgIssueRequest
): Promise<DeleteOrgIssueResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.deleteOrgIssue.bind(client), request)
}
