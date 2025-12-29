import type { GetPlanRequest, GetPlanResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get plan via daemon
 */
export function daemonGetPlan(
  request: GetPlanRequest
): Promise<GetPlanResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getPlan.bind(client), request)
}
