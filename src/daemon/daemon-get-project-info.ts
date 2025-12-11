/* eslint-disable ddd/require-spec-file */
import type { GetProjectInfoRequest, GetProjectInfoResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get project info via daemon
 */
export function daemonGetProjectInfo(
  request: GetProjectInfoRequest
): Promise<GetProjectInfoResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getProjectInfo(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
