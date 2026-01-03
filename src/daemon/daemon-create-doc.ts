import type { CreateDocRequest, CreateDocResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Create a doc via daemon
 */
export function daemonCreateDoc(
  request: CreateDocRequest
): Promise<CreateDocResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.createDoc.bind(client), request)
}
