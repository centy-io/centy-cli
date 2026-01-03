import type { DeletePlanRequest, DeletePlanResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Delete plan via daemon
 */
export function daemonDeletePlan(
  request: DeletePlanRequest
): Promise<DeletePlanResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.deletePlan.bind(client), request)
}
