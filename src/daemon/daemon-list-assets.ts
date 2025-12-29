import type { ListAssetsRequest, ListAssetsResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * List assets via daemon
 */
export function daemonListAssets(
  request: ListAssetsRequest
): Promise<ListAssetsResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.listAssets.bind(client), request)
}
