import type { GetAssetRequest, GetAssetResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get an asset via daemon
 */
export function daemonGetAsset(
  request: GetAssetRequest
): Promise<GetAssetResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getAsset.bind(client), request)
}
