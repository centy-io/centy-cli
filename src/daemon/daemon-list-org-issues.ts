import type { ListOrgIssuesRequest, ListOrgIssuesResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * List organization issues via daemon
 */
export function daemonListOrgIssues(
  request: ListOrgIssuesRequest
): Promise<ListOrgIssuesResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().listOrgIssues(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
