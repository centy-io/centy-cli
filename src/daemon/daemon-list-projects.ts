/* eslint-disable ddd/require-spec-file */
import type { ListProjectsRequest, ListProjectsResponse } from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * List projects via daemon
 */
export function daemonListProjects(
  request: ListProjectsRequest
): Promise<ListProjectsResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().listProjects(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
