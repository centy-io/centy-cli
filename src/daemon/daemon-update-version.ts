/* eslint-disable ddd/require-spec-file */
import type { UpdateVersionRequest, UpdateVersionResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Update project version via daemon
 */
export function daemonUpdateVersion(
  request: UpdateVersionRequest
): Promise<UpdateVersionResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().updateVersion(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
