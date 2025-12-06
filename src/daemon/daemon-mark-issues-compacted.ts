import type {
  MarkIssuesCompactedRequest,
  MarkIssuesCompactedResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Mark issues as compacted via daemon
 */
export function daemonMarkIssuesCompacted(
  request: MarkIssuesCompactedRequest
): Promise<MarkIssuesCompactedResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().markIssuesCompacted(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
