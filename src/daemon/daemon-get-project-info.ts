import type { GetProjectInfoRequest, GetProjectInfoResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get project info via daemon
 */
export function daemonGetProjectInfo(
  request: GetProjectInfoRequest
): Promise<GetProjectInfoResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getProjectInfo.bind(client), request)
}
