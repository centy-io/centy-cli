/* eslint-disable ddd/require-spec-file */
import type { GetDaemonInfoRequest, DaemonInfo } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get daemon info via daemon
 */
export function daemonGetDaemonInfo(
  request: GetDaemonInfoRequest
): Promise<DaemonInfo> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getDaemonInfo(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
