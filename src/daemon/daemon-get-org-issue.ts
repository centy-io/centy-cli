import type { GetOrgIssueRequest, OrgIssue } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get an organization issue by ID via daemon
 */
export function daemonGetOrgIssue(
  request: GetOrgIssueRequest
): Promise<OrgIssue> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getOrgIssue(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
