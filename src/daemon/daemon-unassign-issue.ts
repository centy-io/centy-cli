import type { UnassignIssueRequest, UnassignIssueResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Unassign users from an issue via daemon
 */
export function daemonUnassignIssue(
  request: UnassignIssueRequest
): Promise<UnassignIssueResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().unassignIssue(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
