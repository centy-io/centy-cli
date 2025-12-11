/* eslint-disable ddd/require-spec-file */
import type { GetManifestRequest, Manifest } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Get manifest via daemon
 */
export function daemonGetManifest(
  request: GetManifestRequest
): Promise<Manifest> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getManifest(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
