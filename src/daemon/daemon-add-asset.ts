/* eslint-disable ddd/require-spec-file */
import type { AddAssetRequest, AddAssetResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Add an asset via daemon
 */
export function daemonAddAsset(
  request: AddAssetRequest
): Promise<AddAssetResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().addAsset(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
