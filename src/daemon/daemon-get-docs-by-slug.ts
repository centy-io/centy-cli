import type { GetDocsBySlugRequest, GetDocsBySlugResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Search for docs by slug across all tracked projects
 */
export function daemonGetDocsBySlug(
  request: GetDocsBySlugRequest
): Promise<GetDocsBySlugResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getDocsBySlug.bind(client), request)
}
