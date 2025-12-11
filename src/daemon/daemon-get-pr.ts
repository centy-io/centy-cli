/* eslint-disable ddd/require-spec-file */
import type { GetPrRequest, PullRequest } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get a PR by ID via daemon
 */
export function daemonGetPr(request: GetPrRequest): Promise<PullRequest> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getPr(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
