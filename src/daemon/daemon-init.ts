import type { InitRequest, InitResponse } from './types.js'
import {
  getDaemonClient,
  callWithDeadline,
  LONG_GRPC_TIMEOUT_MS,
} from './load-proto.js'

/**
 * Initialize centy via daemon
 * Uses a longer timeout as init can be slow for large projects
 */
export function daemonInit(request: InitRequest): Promise<InitResponse> {
  const client = getDaemonClient()
  return callWithDeadline(
    client.init.bind(client),
    request,
    LONG_GRPC_TIMEOUT_MS
  )
}
