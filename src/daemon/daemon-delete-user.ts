import type { DeleteUserRequest, DeleteUserResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Delete a user via daemon
 */
export function daemonDeleteUser(
  request: DeleteUserRequest
): Promise<DeleteUserResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().deleteUser(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
