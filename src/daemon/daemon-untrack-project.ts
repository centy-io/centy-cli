/* eslint-disable ddd/require-spec-file */
import type { UntrackProjectRequest, UntrackProjectResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Untrack a project via daemon
 */
export function daemonUntrackProject(
  request: UntrackProjectRequest
): Promise<UntrackProjectResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().untrackProject(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
