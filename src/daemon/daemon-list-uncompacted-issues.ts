import type {
  ListUncompactedIssuesRequest,
  ListUncompactedIssuesResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * List uncompacted issues via daemon
 */
export function daemonListUncompactedIssues(
  request: ListUncompactedIssuesRequest
): Promise<ListUncompactedIssuesResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().listUncompactedIssues(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
