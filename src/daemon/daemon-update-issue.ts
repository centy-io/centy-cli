/* eslint-disable ddd/require-spec-file */
import type { UpdateIssueRequest, UpdateIssueResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Update an issue via daemon
 */
export function daemonUpdateIssue(
  request: UpdateIssueRequest
): Promise<UpdateIssueResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().updateIssue(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
