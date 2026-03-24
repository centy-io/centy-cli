import type {
  ListItemsAcrossProjectsRequest,
  ListItemsAcrossProjectsResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List items of a given type across all tracked projects via daemon
 */
export function daemonListItemsAcrossProjects(
  request: ListItemsAcrossProjectsRequest
): Promise<ListItemsAcrossProjectsResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listItemsAcrossProjects.bind(client), request)
}
