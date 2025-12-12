import type { CreateOrgIssueRequest, CreateOrgIssueResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Create a new organization issue via daemon
 */
export function daemonCreateOrgIssue(
  request: CreateOrgIssueRequest
): Promise<CreateOrgIssueResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().createOrgIssue(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
