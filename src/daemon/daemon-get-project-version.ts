import type { GetProjectVersionRequest, ProjectVersionInfo } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get project version info via daemon
 */
export function daemonGetProjectVersion(
  request: GetProjectVersionRequest
): Promise<ProjectVersionInfo> {
  const client = getDaemonClient()
  return callWithDeadline(client.getProjectVersion.bind(client), request)
}
