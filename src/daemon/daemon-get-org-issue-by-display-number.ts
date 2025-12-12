import type { GetOrgIssueByDisplayNumberRequest, OrgIssue } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get an organization issue by display number via daemon
 */
export function daemonGetOrgIssueByDisplayNumber(
  request: GetOrgIssueByDisplayNumberRequest
): Promise<OrgIssue> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getOrgIssueByDisplayNumber(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
