import type { UpdateOrgIssueRequest, UpdateOrgIssueResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Update an organization issue via daemon
 */
export function daemonUpdateOrgIssue(
  request: UpdateOrgIssueRequest
): Promise<UpdateOrgIssueResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.updateOrgIssue.bind(client), request)
}
