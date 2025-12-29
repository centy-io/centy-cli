import type { ListUsersRequest, ListUsersResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List users via daemon
 */
export function daemonListUsers(
  request: ListUsersRequest
): Promise<ListUsersResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listUsers.bind(client), request)
}
