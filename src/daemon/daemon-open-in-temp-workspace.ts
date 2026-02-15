import type {
  OpenInTempWorkspaceWithEditorRequest,
  OpenInTempWorkspaceResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Open an issue in a temporary workspace via daemon
 */
export function daemonOpenInTempWorkspace(
  request: OpenInTempWorkspaceWithEditorRequest
): Promise<OpenInTempWorkspaceResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.openInTempWorkspace.bind(client), request)
}
