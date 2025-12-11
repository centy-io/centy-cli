/* eslint-disable ddd/require-spec-file */
import type {
  GetIssuesByUuidRequest,
  GetIssuesByUuidResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Search for issues by UUID across all tracked projects
 */
export function daemonGetIssuesByUuid(
  request: GetIssuesByUuidRequest
): Promise<GetIssuesByUuidResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getIssuesByUuid(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
