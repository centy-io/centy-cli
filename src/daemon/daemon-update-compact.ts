import type { UpdateCompactRequest, UpdateCompactResponse } from './types.js'
import {
  getDaemonClient,
  callWithDeadline,
  LONG_GRPC_TIMEOUT_MS,
} from './load-proto.js'

/**
 * Update compact.md content via daemon
 */
export function daemonUpdateCompact(
  request: UpdateCompactRequest
): Promise<UpdateCompactResponse> {
  const client = getDaemonClient()
  return callWithDeadline(
    client.updateCompact.bind(client),
    request,
    LONG_GRPC_TIMEOUT_MS
  )
}
