import type { GetUserRequest, User } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'
import { DaemonResponseError } from './daemon-response-error.js'

/**
 * Get a single user by ID via daemon
 */
export async function daemonGetUser(request: GetUserRequest): Promise<User> {
  const client = getDaemonClient()
  const response = await callWithDeadline(client.getUser.bind(client), request)
  if (!response.user) {
    throw new DaemonResponseError(response.error || 'User not found')
  }
  return response.user
}
