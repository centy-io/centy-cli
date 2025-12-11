/* eslint-disable ddd/require-spec-file */
import type { ListIssuesRequest, ListIssuesResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * List issues via daemon
 */
export function daemonListIssues(
  request: ListIssuesRequest
): Promise<ListIssuesResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().listIssues(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
