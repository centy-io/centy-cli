import type { CreateOrgIssueRequest, CreateOrgIssueResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Create a new organization issue via daemon
 */
export function daemonCreateOrgIssue(
  request: CreateOrgIssueRequest
): Promise<CreateOrgIssueResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.createOrgIssue.bind(client), request)
}
