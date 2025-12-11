/* eslint-disable ddd/require-spec-file */
import type { CreateIssueRequest, CreateIssueResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Create an issue via daemon
 */
export function daemonCreateIssue(
  request: CreateIssueRequest
): Promise<CreateIssueResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().createIssue(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
