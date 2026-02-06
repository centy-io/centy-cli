import type { GetDocRequest, Doc } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'
import { DaemonResponseError } from './daemon-response-error.js'

/**
 * Get a doc by slug via daemon
 */
export async function daemonGetDoc(request: GetDocRequest): Promise<Doc> {
  const client = getDaemonClient()
  const response = await callWithDeadline(client.getDoc.bind(client), request)
  if (!response.doc) {
    throw new DaemonResponseError(response.error || 'Doc not found')
  }
  return response.doc
}
