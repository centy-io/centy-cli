/* eslint-disable ddd/require-spec-file */
import type {
  RegisterProjectRequest,
  RegisterProjectResponse,
} from './types.js'
import { getDaemonClient } from './load-proto.js'

/**
 * Register a project via daemon
 */
export function daemonRegisterProject(
  request: RegisterProjectRequest
): Promise<RegisterProjectResponse> {
  return new Promise((resolve, reject) => {
    getDaemonClient().registerProject(request, (error, response) => {
      if (error !== null) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
}
