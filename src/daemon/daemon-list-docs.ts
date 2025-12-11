/* eslint-disable ddd/require-spec-file */
import type { ListDocsRequest, ListDocsResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * List docs via daemon
 */
export function daemonListDocs(
  request: ListDocsRequest
): Promise<ListDocsResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().listDocs(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
