import type { UpdateUserRequest, UpdateUserResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Update a user via daemon
 */
export function daemonUpdateUser(
  request: UpdateUserRequest
): Promise<UpdateUserResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.updateUser.bind(client), request)
}
