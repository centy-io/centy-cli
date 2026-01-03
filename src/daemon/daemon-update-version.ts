import type { UpdateVersionRequest, UpdateVersionResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Update project version via daemon
 */
export function daemonUpdateVersion(
  request: UpdateVersionRequest
): Promise<UpdateVersionResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.updateVersion.bind(client), request)
}
