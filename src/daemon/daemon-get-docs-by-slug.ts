import type { GetDocsBySlugRequest, GetDocsBySlugResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Search for docs by slug across all tracked projects
 */
export function daemonGetDocsBySlug(
  request: GetDocsBySlugRequest
): Promise<GetDocsBySlugResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().getDocsBySlug(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
