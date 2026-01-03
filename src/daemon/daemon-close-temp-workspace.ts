import type {
  CloseTempWorkspaceRequest,
  CloseTempWorkspaceResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Close and remove a temporary workspace
 */
export function daemonCloseTempWorkspace(
  request: CloseTempWorkspaceRequest
): Promise<CloseTempWorkspaceResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.closeTempWorkspace.bind(client), request)
}
