import type { DuplicateIssueRequest, DuplicateIssueResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Duplicate an issue (same or different project) via daemon
 */
export function daemonDuplicateIssue(
  request: DuplicateIssueRequest
): Promise<DuplicateIssueResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.duplicateIssue.bind(client), request)
}
