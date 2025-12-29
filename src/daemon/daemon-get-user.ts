import type { GetUserRequest, User } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get a single user by ID via daemon
 */
export function daemonGetUser(request: GetUserRequest): Promise<User> {
  const client = getDaemonClient()
  return callWithDeadline(client.getUser.bind(client), request)
}
