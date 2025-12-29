import type { UntrackProjectRequest, UntrackProjectResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Untrack a project via daemon
 */
export function daemonUntrackProject(
  request: UntrackProjectRequest
): Promise<UntrackProjectResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.untrackProject.bind(client), request)
}
