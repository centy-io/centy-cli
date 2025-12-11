/* eslint-disable ddd/require-spec-file */
import type { ExecuteReconciliationRequest, InitResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Execute reconciliation via daemon
 */
export function daemonExecuteReconciliation(
  request: ExecuteReconciliationRequest
): Promise<InitResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().executeReconciliation(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
