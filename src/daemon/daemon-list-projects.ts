import type { ListProjectsRequest, ListProjectsResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List projects via daemon
 */
export function daemonListProjects(
  request: ListProjectsRequest
): Promise<ListProjectsResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listProjects.bind(client), request)
}
