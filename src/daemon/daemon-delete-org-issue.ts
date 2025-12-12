import type { DeleteOrgIssueRequest, DeleteOrgIssueResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Delete an organization issue via daemon
 */
export function daemonDeleteOrgIssue(
  request: DeleteOrgIssueRequest
): Promise<DeleteOrgIssueResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().deleteOrgIssue(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
