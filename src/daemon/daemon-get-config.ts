/* eslint-disable ddd/require-spec-file */
import type { GetConfigRequest, Config } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get config via daemon
 */
export function daemonGetConfig(request: GetConfigRequest): Promise<Config> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getConfig(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
