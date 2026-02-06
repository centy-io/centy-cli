import type { GetIssueRequest, Issue } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'
import { DaemonResponseError } from './daemon-response-error.js'

/**
 * Get a single issue by ID via daemon
 */
export async function daemonGetIssue(request: GetIssueRequest): Promise<Issue> {
  const client = getDaemonClient()
  const response = await callWithDeadline(client.getIssue.bind(client), request)
  if (!response.issue) {
    throw new DaemonResponseError(response.error || 'Issue not found')
  }
  return response.issue
}
