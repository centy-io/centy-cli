import type { GetManifestRequest, Manifest } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get manifest via daemon
 */
export function daemonGetManifest(
  request: GetManifestRequest
): Promise<Manifest> {
  const client = getDaemonClient()
  return callWithDeadline(client.getManifest.bind(client), request)
}
