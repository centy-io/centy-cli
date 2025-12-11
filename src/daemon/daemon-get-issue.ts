/* eslint-disable ddd/require-spec-file */
import type { GetIssueRequest, Issue } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get a single issue by ID via daemon
 */
export function daemonGetIssue(request: GetIssueRequest): Promise<Issue> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getIssue(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
