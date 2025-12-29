import type { ExecuteReconciliationRequest, InitResponse } from './types.js'
import {
  getDaemonClient,
  callWithDeadline,
  LONG_GRPC_TIMEOUT_MS,
} from './load-proto.js'

/**
 * Execute reconciliation via daemon
 */
export function daemonExecuteReconciliation(
  request: ExecuteReconciliationRequest
): Promise<InitResponse> {
  const client = getDaemonClient()
  return callWithDeadline(
    client.executeReconciliation.bind(client),
    request,
    LONG_GRPC_TIMEOUT_MS
  )
}
