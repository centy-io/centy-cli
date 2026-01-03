import type { GetIssueRequest, Issue } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get a single issue by ID via daemon
 */
export function daemonGetIssue(request: GetIssueRequest): Promise<Issue> {
  const client = getDaemonClient()
  return callWithDeadline(client.getIssue.bind(client), request)
}
