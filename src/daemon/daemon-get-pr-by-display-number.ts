/* eslint-disable ddd/require-spec-file */
import type { GetPrByDisplayNumberRequest, PullRequest } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get a PR by display number via daemon
 */
export function daemonGetPrByDisplayNumber(
  request: GetPrByDisplayNumberRequest
): Promise<PullRequest> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getPrByDisplayNumber(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
