import type { UpdatePlanRequest, UpdatePlanResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Update (create or modify) plan via daemon
 */
export function daemonUpdatePlan(
  request: UpdatePlanRequest
): Promise<UpdatePlanResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.updatePlan.bind(client), request)
}
