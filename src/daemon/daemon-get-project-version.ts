/* eslint-disable ddd/require-spec-file */
import type { GetProjectVersionRequest, ProjectVersionInfo } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get project version info via daemon
 */
export function daemonGetProjectVersion(
  request: GetProjectVersionRequest
): Promise<ProjectVersionInfo> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getProjectVersion(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
