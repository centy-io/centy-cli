import type {
  RegisterProjectRequest,
  RegisterProjectResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Register a project via daemon
 */
export function daemonRegisterProject(
  request: RegisterProjectRequest
): Promise<RegisterProjectResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.registerProject.bind(client), request)
}
