import type { GetConfigRequest, Config } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'
import { DaemonResponseError } from './daemon-response-error.js'

/**
 * Get config via daemon
 */
export async function daemonGetConfig(
  request: GetConfigRequest
): Promise<Config> {
  const client = getDaemonClient()
  const response = await callWithDeadline(
    client.getConfig.bind(client),
    request
  )
  if (!response.config) {
    throw new DaemonResponseError(response.error || 'Config not found')
  }
  return response.config
}
