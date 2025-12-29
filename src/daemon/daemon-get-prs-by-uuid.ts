import type { GetPrsByUuidRequest, GetPrsByUuidResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Search for PRs by UUID across all tracked projects
 */
export function daemonGetPrsByUuid(
  request: GetPrsByUuidRequest
): Promise<GetPrsByUuidResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getPrsByUuid.bind(client), request)
}
