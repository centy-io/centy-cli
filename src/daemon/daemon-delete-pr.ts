/* eslint-disable ddd/require-spec-file */
import type { DeletePrRequest, DeletePrResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Delete a PR via daemon
 */
export function daemonDeletePr(
  request: DeletePrRequest
): Promise<DeletePrResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().deletePr(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
