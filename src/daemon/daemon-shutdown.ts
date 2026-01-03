import type { ShutdownRequest, ShutdownResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Shutdown the daemon gracefully
 */
export function daemonShutdown(
  request: ShutdownRequest
): Promise<ShutdownResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.shutdown.bind(client), request)
}
