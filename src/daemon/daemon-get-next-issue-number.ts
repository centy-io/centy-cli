import type {
  GetNextIssueNumberRequest,
  GetNextIssueNumberResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get the next issue number via daemon
 */
export function daemonGetNextIssueNumber(
  request: GetNextIssueNumberRequest
): Promise<GetNextIssueNumberResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getNextIssueNumber(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
