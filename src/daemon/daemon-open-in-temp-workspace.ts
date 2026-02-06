import type {
  OpenInTempWorkspaceRequest,
  OpenInTempWorkspaceResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Open an issue in a temporary workspace via daemon
 */
export function daemonOpenInTempWorkspace(
  request: OpenInTempWorkspaceRequest
): Promise<OpenInTempWorkspaceResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.openInTempWorkspace.bind(client), request)
}
