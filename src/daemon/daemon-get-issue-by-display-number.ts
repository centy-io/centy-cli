import type { GenericItem } from './types.js'
import { getDaemonClient, callWithDeadline } from './load-proto.js'
import { DaemonResponseError } from './daemon-response-error.js'

/**
 * Get a single issue by display number via daemon
 */
export async function daemonGetIssueByDisplayNumber(request: {
  projectPath: string
  displayNumber: number
}): Promise<GenericItem> {
  const client = getDaemonClient()
  const response = await callWithDeadline(client.getItem.bind(client), {
    projectPath: request.projectPath,
    itemType: 'issues',
    itemId: '',
    displayNumber: request.displayNumber,
  })
  if (!response.item) {
    throw new DaemonResponseError(response.error || 'Issue not found')
  }
  return response.item
}
