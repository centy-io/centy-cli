import type { GetPrByDisplayNumberRequest, PullRequest } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'
import { DaemonResponseError } from './daemon-response-error.js'

/**
 * Get a PR by display number via daemon
 */
export async function daemonGetPrByDisplayNumber(
  request: GetPrByDisplayNumberRequest
): Promise<PullRequest> {
  const client = getDaemonClient()
  const response = await callWithDeadline(
    client.getPrByDisplayNumber.bind(client),
    request
  )
  if (!response.pr) {
    throw new DaemonResponseError(response.error || 'PR not found')
  }
  return response.pr
}
