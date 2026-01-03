import type {
  SetProjectTitleRequest,
  SetProjectTitleResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Set project-scope title via daemon
 * This title is stored in .centy/project.json and is visible to all users (version-controlled)
 */
export function daemonSetProjectTitle(
  request: SetProjectTitleRequest
): Promise<SetProjectTitleResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.setProjectTitle.bind(client), request)
}
