import type {
  GetIssuesByUuidRequest,
  GetIssuesByUuidResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Search for issues by UUID across all tracked projects
 */
export function daemonGetIssuesByUuid(
  request: GetIssuesByUuidRequest
): Promise<GetIssuesByUuidResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getIssuesByUuid.bind(client), request)
}
