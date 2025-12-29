import type {
  UpdateOrgConfigRequest,
  UpdateOrgConfigResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Update organization config via daemon
 */
export function daemonUpdateOrgConfig(
  request: UpdateOrgConfigRequest
): Promise<UpdateOrgConfigResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.updateOrgConfig.bind(client), request)
}
