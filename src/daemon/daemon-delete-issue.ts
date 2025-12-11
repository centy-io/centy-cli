/* eslint-disable ddd/require-spec-file */
import type { DeleteIssueRequest, DeleteIssueResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Delete an issue via daemon
 */
export function daemonDeleteIssue(
  request: DeleteIssueRequest
): Promise<DeleteIssueResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().deleteIssue(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
