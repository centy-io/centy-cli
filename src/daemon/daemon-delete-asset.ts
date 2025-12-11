/* eslint-disable ddd/require-spec-file */
import type { DeleteAssetRequest, DeleteAssetResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Delete an asset via daemon
 */
export function daemonDeleteAsset(
  request: DeleteAssetRequest
): Promise<DeleteAssetResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().deleteAsset(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
