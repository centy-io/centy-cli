import type {
  SetProjectFavoriteRequest,
  SetProjectFavoriteResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Set project favorite status via daemon
 */
export function daemonSetProjectFavorite(
  request: SetProjectFavoriteRequest
): Promise<SetProjectFavoriteResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.setProjectFavorite.bind(client), request)
}
