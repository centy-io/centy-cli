import type { CreateUserRequest, CreateUserResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Create a user via daemon
 */
export function daemonCreateUser(
  request: CreateUserRequest
): Promise<CreateUserResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.createUser.bind(client), request)
}
