import type { IsInitializedRequest, IsInitializedResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Check if centy is initialized via daemon
 */
export function daemonIsInitialized(
  request: IsInitializedRequest
): Promise<IsInitializedResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.isInitialized.bind(client), request)
}
