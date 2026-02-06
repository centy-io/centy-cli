import type { GetPrRequest, PullRequest } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'
import { DaemonResponseError } from './daemon-response-error.js'

/**
 * Get a PR by ID via daemon
 */
export async function daemonGetPr(request: GetPrRequest): Promise<PullRequest> {
  const client = getDaemonClient()
  const response = await callWithDeadline(client.getPr.bind(client), request)
  if (!response.pr) {
    throw new DaemonResponseError(response.error || 'PR not found')
  }
  return response.pr
}
