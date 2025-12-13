import type { GetUserRequest, User } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get a single user by ID via daemon
 */
export function daemonGetUser(request: GetUserRequest): Promise<User> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getUser(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
