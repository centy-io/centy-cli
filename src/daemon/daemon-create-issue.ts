import type { CreateIssueRequest, CreateIssueResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Create an issue via daemon
 */
export function daemonCreateIssue(
  request: CreateIssueRequest
): Promise<CreateIssueResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.createIssue.bind(client), request)
}
