import type {
  SetProjectFavoriteRequest,
  SetProjectFavoriteResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Set project favorite status via daemon
 */
export function daemonSetProjectFavorite(
  request: SetProjectFavoriteRequest
): Promise<SetProjectFavoriteResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().setProjectFavorite(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
