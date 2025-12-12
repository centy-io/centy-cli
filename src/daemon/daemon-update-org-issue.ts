import type { UpdateOrgIssueRequest, UpdateOrgIssueResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Update an organization issue via daemon
 */
export function daemonUpdateOrgIssue(
  request: UpdateOrgIssueRequest
): Promise<UpdateOrgIssueResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().updateOrgIssue(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
