import type { AddAssetRequest, AddAssetResponse } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Add an asset via daemon
 */
export function daemonAddAsset(
  request: AddAssetRequest
): Promise<AddAssetResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.addAsset.bind(client), request)
}
