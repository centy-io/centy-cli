/* eslint-disable ddd/require-spec-file */
import type { DeleteDocRequest, DeleteDocResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Delete a doc via daemon
 */
export function daemonDeleteDoc(
  request: DeleteDocRequest
): Promise<DeleteDocResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().deleteDoc(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
