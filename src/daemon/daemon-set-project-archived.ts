import type {
  SetProjectArchivedRequest,
  SetProjectArchivedResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Set project archived status via daemon
 */
export function daemonSetProjectArchived(
  request: SetProjectArchivedRequest
): Promise<SetProjectArchivedResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().setProjectArchived(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
