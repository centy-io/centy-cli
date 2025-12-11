/* eslint-disable ddd/require-spec-file */
import type { ListSharedAssetsRequest, ListAssetsResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * List shared assets via daemon
 */
export function daemonListSharedAssets(
  request: ListSharedAssetsRequest
): Promise<ListAssetsResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().listSharedAssets(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
