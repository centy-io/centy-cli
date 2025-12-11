/* eslint-disable ddd/require-spec-file */
import type {
  GetReconciliationPlanRequest,
  ReconciliationPlan,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get reconciliation plan from daemon
 */
export function daemonGetReconciliationPlan(
  request: GetReconciliationPlanRequest
): Promise<ReconciliationPlan> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getReconciliationPlan(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
