import type { CreatePrRequest, CreatePrResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Create a PR via daemon
 */
export function daemonCreatePr(
  request: CreatePrRequest
): Promise<CreatePrResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.createPr.bind(client), request)
}
