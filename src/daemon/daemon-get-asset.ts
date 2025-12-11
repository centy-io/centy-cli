/* eslint-disable ddd/require-spec-file */
import type { GetAssetRequest, GetAssetResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get an asset via daemon
 */
export function daemonGetAsset(
  request: GetAssetRequest
): Promise<GetAssetResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getAsset(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
