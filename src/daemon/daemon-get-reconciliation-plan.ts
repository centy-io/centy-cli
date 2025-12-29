import type {
  GetReconciliationPlanRequest,
  ReconciliationPlan,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get reconciliation plan from daemon
 */
export function daemonGetReconciliationPlan(
  request: GetReconciliationPlanRequest
): Promise<ReconciliationPlan> {
  const client = getDaemonClient()
  return callWithDeadline(client.getReconciliationPlan.bind(client), request)
}
