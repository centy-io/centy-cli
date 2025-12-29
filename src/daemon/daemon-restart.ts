import type { RestartRequest, RestartResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Restart the daemon
 */
export function daemonRestart(
  request: RestartRequest
): Promise<RestartResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.restart.bind(client), request)
}
