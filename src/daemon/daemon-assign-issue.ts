import type { AssignIssueRequest, AssignIssueResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Assign users to an issue via daemon
 */
export function daemonAssignIssue(
  request: AssignIssueRequest
): Promise<AssignIssueResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().assignIssue(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
