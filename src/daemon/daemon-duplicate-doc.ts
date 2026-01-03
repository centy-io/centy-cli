import type { DuplicateDocRequest, DuplicateDocResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Duplicate a doc (same or different project) via daemon
 */
export function daemonDuplicateDoc(
  request: DuplicateDocRequest
): Promise<DuplicateDocResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.duplicateDoc.bind(client), request)
}
