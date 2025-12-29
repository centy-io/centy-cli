import type { GetDaemonInfoRequest, DaemonInfo } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get daemon info via daemon
 */
export function daemonGetDaemonInfo(
  request: GetDaemonInfoRequest
): Promise<DaemonInfo> {
  const client = getDaemonClient()
  return callWithDeadline(client.getDaemonInfo.bind(client), request)
}
