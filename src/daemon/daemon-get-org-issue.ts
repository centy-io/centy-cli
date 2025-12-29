import type { GetOrgIssueRequest, OrgIssue } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get an organization issue by ID via daemon
 */
export function daemonGetOrgIssue(
  request: GetOrgIssueRequest
): Promise<OrgIssue> {
  const client = getDaemonClient()
  return callWithDeadline(client.getOrgIssue.bind(client), request)
}
