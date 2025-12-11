/* eslint-disable ddd/require-spec-file */
import type { ListAssetsRequest, ListAssetsResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * List assets via daemon
 */
export function daemonListAssets(
  request: ListAssetsRequest
): Promise<ListAssetsResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().listAssets(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
