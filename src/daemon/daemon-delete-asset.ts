import type { DeleteAssetRequest, DeleteAssetResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Delete an asset via daemon
 */
export function daemonDeleteAsset(
  request: DeleteAssetRequest
): Promise<DeleteAssetResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.deleteAsset.bind(client), request)
}
