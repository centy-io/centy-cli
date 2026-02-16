import { daemonGetIssueByDisplayNumber } from '../../daemon/daemon-get-issue-by-display-number.js'
import { daemonUpdateIssue } from '../../daemon/daemon-update-issue.js'
import { CloseEntityError } from './close-entity-error.js'

export async function closeIssue(
  projectPath: string,
  displayNumber: number,
  jsonOutput: boolean,
  log: (msg: string) => void
): Promise<void> {
  const issue = await daemonGetIssueByDisplayNumber({
    projectPath,
    displayNumber,
  })

  const response = await daemonUpdateIssue({
    projectPath,
    issueId: issue.id,
    title: '',
    description: '',
    status: 'closed',
    priority: 0,
    customFields: {},
  })

  if (!response.success) {
    throw new CloseEntityError(response.error)
  }

  if (jsonOutput) {
    log(JSON.stringify({ type: 'issue', ...response.issue! }, null, 2))
    return
  }

  log(`Closed issue #${response.issue!.displayNumber}`)
}
