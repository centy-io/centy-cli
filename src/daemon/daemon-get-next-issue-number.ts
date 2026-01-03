import type {
  GetNextIssueNumberRequest,
  GetNextIssueNumberResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get the next issue number via daemon
 */
export function daemonGetNextIssueNumber(
  request: GetNextIssueNumberRequest
): Promise<GetNextIssueNumberResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getNextIssueNumber.bind(client), request)
}
