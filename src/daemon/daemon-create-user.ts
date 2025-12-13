import type { CreateUserRequest, CreateUserResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Create a user via daemon
 */
export function daemonCreateUser(
  request: CreateUserRequest
): Promise<CreateUserResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().createUser(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
