/* eslint-disable ddd/require-spec-file */
import type { GetIssueByDisplayNumberRequest, Issue } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get a single issue by display number via daemon
 */
export function daemonGetIssueByDisplayNumber(
  request: GetIssueByDisplayNumberRequest
): Promise<Issue> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getIssueByDisplayNumber(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
