import type {
  SetProjectUserTitleRequest,
  SetProjectUserTitleResponse,
} from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'

/**
 * Set project user-scope title via daemon
 * This title is stored in ~/.centy/projects.json and is only visible to the current user
 */
export function daemonSetProjectUserTitle(
  request: SetProjectUserTitleRequest
): Promise<SetProjectUserTitleResponse> {
  const client = getDaemonClient()
  return callWithDeadline(client.setProjectUserTitle.bind(client), request)
}
