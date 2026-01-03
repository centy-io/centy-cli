import type { GetOrgIssueByDisplayNumberRequest, OrgIssue } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get an organization issue by display number via daemon
 */
export function daemonGetOrgIssueByDisplayNumber(
  request: GetOrgIssueByDisplayNumberRequest
): Promise<OrgIssue> {
  const client = getDaemonClient()
  return callWithDeadline(
    client.getOrgIssueByDisplayNumber.bind(client),
    request
  )
}
