import type { ListOrgIssuesRequest, ListOrgIssuesResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List organization issues via daemon
 */
export function daemonListOrgIssues(
  request: ListOrgIssuesRequest
): Promise<ListOrgIssuesResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listOrgIssues.bind(client), request)
}
