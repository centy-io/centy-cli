/* eslint-disable ddd/require-spec-file */
import type { UpdatePrRequest, UpdatePrResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Update a PR via daemon
 */
export function daemonUpdatePr(
  request: UpdatePrRequest
): Promise<UpdatePrResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().updatePr(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
