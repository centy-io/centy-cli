import type { GetConfigRequest, Config } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get config via daemon
 */
export function daemonGetConfig(request: GetConfigRequest): Promise<Config> {
  const client = getDaemonClient()
  return callWithDeadline(client.getConfig.bind(client), request)
}
