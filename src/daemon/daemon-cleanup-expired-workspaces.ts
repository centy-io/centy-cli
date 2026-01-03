import type {
  CleanupExpiredWorkspacesRequest,
  CleanupExpiredWorkspacesResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Cleanup all expired temporary workspaces
 */
export function daemonCleanupExpiredWorkspaces(
  request: CleanupExpiredWorkspacesRequest
): Promise<CleanupExpiredWorkspacesResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.cleanupExpiredWorkspaces.bind(client), request)
}
