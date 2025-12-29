import type {
  MarkIssuesCompactedRequest,
  MarkIssuesCompactedResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Mark issues as compacted via daemon
 */
export function daemonMarkIssuesCompacted(
  request: MarkIssuesCompactedRequest
): Promise<MarkIssuesCompactedResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.markIssuesCompacted.bind(client), request)
}
