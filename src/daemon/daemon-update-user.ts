import type { UpdateUserRequest, UpdateUserResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Update a user via daemon
 */
export function daemonUpdateUser(
  request: UpdateUserRequest
): Promise<UpdateUserResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().updateUser(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
