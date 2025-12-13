import type { SyncUsersRequest, SyncUsersResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Sync users from git history via daemon
 */
export function daemonSyncUsers(
  request: SyncUsersRequest
): Promise<SyncUsersResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().syncUsers(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
