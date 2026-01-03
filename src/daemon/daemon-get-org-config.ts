import type { GetOrgConfigRequest, OrgConfig } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get organization config via daemon
 */
export function daemonGetOrgConfig(
  request: GetOrgConfigRequest
): Promise<OrgConfig> {
  const client = getDaemonClient()
  return callWithDeadline(client.getOrgConfig.bind(client), request)
}
