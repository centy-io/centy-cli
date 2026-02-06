import type { GetIssueByDisplayNumberRequest, Issue } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'
import { DaemonResponseError } from './daemon-response-error.js'

/**
 * Get a single issue by display number via daemon
 */
export async function daemonGetIssueByDisplayNumber(
  request: GetIssueByDisplayNumberRequest
): Promise<Issue> {
  const client = getDaemonClient()
  const response = await callWithDeadline(
    client.getIssueByDisplayNumber.bind(client),
    request
  )
  if (!response.issue) {
    throw new DaemonResponseError(response.error || 'Issue not found')
  }
  return response.issue
}
