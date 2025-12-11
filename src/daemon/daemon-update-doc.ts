/* eslint-disable ddd/require-spec-file */
import type { UpdateDocRequest, UpdateDocResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Update a doc via daemon
 */
export function daemonUpdateDoc(
  request: UpdateDocRequest
): Promise<UpdateDocResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().updateDoc(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
