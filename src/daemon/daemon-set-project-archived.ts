import type {
  SetProjectArchivedRequest,
  SetProjectArchivedResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Set project archived status via daemon
 */
export function daemonSetProjectArchived(
  request: SetProjectArchivedRequest
): Promise<SetProjectArchivedResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.setProjectArchived.bind(client), request)
}
