import type { GetCompactRequest, GetCompactResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get compact.md content via daemon
 */
export function daemonGetCompact(
  request: GetCompactRequest
): Promise<GetCompactResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getCompact.bind(client), request)
}
