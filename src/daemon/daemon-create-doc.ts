/* eslint-disable ddd/require-spec-file */
import type { CreateDocRequest, CreateDocResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Create a doc via daemon
 */
export function daemonCreateDoc(
  request: CreateDocRequest
): Promise<CreateDocResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().createDoc(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
