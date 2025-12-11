/* eslint-disable ddd/require-spec-file */
import type { InitRequest, InitResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Initialize centy via daemon
 */
export function daemonInit(request: InitRequest): Promise<InitResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().init(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
