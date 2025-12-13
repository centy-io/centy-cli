import type { ListUsersRequest, ListUsersResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * List users via daemon
 */
export function daemonListUsers(
  request: ListUsersRequest
): Promise<ListUsersResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().listUsers(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
