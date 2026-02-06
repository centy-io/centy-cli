import type { GetManifestRequest, Manifest } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'
import { DaemonResponseError } from './daemon-response-error.js'

/**
 * Get manifest via daemon
 */
export async function daemonGetManifest(
  request: GetManifestRequest
): Promise<Manifest> {
  const client = getDaemonClient()
  const response = await callWithDeadline(
    client.getManifest.bind(client),
    request
  )
  if (!response.manifest) {
    throw new DaemonResponseError(response.error || 'Manifest not found')
  }
  return response.manifest
}
