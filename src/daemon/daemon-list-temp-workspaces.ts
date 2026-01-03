import type {
  ListTempWorkspacesRequest,
  ListTempWorkspacesResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List all temporary workspaces
 */
export function daemonListTempWorkspaces(
  request: ListTempWorkspacesRequest
): Promise<ListTempWorkspacesResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listTempWorkspaces.bind(client), request)
}
