import type {
  ListUncompactedIssuesRequest,
  ListUncompactedIssuesResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List uncompacted issues via daemon
 */
export function daemonListUncompactedIssues(
  request: ListUncompactedIssuesRequest
): Promise<ListUncompactedIssuesResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listUncompactedIssues.bind(client), request)
}
