import type {
  OpenStandaloneWorkspaceWithEditorRequest,
  OpenStandaloneWorkspaceResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Open a standalone workspace (not tied to an issue) via daemon
 */
export function daemonOpenStandaloneWorkspace(
  request: OpenStandaloneWorkspaceWithEditorRequest
): Promise<OpenStandaloneWorkspaceResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.openStandaloneWorkspace.bind(client), request)
}
