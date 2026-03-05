import type { SearchItemsResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Search for docs by slug across all tracked projects
 */
export function daemonGetDocsBySlug(request: {
  slug: string
}): Promise<SearchItemsResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.searchItems.bind(client), {
    itemType: 'docs',
    itemId: request.slug,
  })
}
