/* eslint-disable ddd/require-spec-file */
import type { IsInitializedRequest, IsInitializedResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Check if centy is initialized via daemon
 */
export function daemonIsInitialized(
  request: IsInitializedRequest
): Promise<IsInitializedResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().isInitialized(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
