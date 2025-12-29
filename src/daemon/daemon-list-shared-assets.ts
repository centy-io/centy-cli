import type { ListSharedAssetsRequest, ListAssetsResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List shared assets via daemon
 */
export function daemonListSharedAssets(
  request: ListSharedAssetsRequest
): Promise<ListAssetsResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listSharedAssets.bind(client), request)
}
