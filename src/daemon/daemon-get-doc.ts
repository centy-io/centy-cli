/* eslint-disable ddd/require-spec-file */
import type { GetDocRequest, Doc } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get a doc by slug via daemon
 */
export function daemonGetDoc(request: GetDocRequest): Promise<Doc> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getDoc(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
