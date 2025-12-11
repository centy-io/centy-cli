/* eslint-disable ddd/require-spec-file */
import type { ListPrsRequest, ListPrsResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * List PRs via daemon
 */
export function daemonListPrs(
  request: ListPrsRequest
): Promise<ListPrsResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().listPrs(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
