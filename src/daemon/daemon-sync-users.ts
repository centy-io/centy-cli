import type { SyncUsersRequest, SyncUsersResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Sync users from git history via daemon
 */
export function daemonSyncUsers(
  request: SyncUsersRequest
): Promise<SyncUsersResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.syncUsers.bind(client), request)
}
