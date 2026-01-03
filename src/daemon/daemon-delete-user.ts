import type { DeleteUserRequest, DeleteUserResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Delete a user via daemon
 */
export function daemonDeleteUser(
  request: DeleteUserRequest
): Promise<DeleteUserResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.deleteUser.bind(client), request)
}
