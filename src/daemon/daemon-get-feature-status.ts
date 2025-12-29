import type {
  GetFeatureStatusRequest,
  GetFeatureStatusResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Get feature status via daemon
 */
export function daemonGetFeatureStatus(
  request: GetFeatureStatusRequest
): Promise<GetFeatureStatusResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.getFeatureStatus.bind(client), request)
}
