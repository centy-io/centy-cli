import type { ListIssuesRequest, ListIssuesResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List issues via daemon
 */
export function daemonListIssues(
  request: ListIssuesRequest
): Promise<ListIssuesResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listIssues.bind(client), request)
}
