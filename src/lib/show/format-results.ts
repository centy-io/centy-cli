import type { IssueWithProject } from '../../daemon/types.js'

export function formatIssueResults(
  issues: IssueWithProject[],
  log: (msg: string) => void
): void {
  for (const iwp of issues) {
    const issue = iwp.issue!
    const meta = issue.metadata
    log(`--- Project: ${iwp.projectName} (${iwp.projectPath}) ---`)
    log(`Issue #${issue.displayNumber}`)
    log(`ID: ${issue.id}`)
    log(`Title: ${issue.title}`)
    log(`Status: ${meta !== undefined ? meta.status : 'unknown'}`)
    log(
      `Priority: ${meta !== undefined ? (meta.priorityLabel !== '' ? meta.priorityLabel : `P${meta.priority}`) : 'P?'}`
    )
    log(`Created: ${meta !== undefined ? meta.createdAt : 'unknown'}`)
    log(`Updated: ${meta !== undefined ? meta.updatedAt : 'unknown'}`)
    if (issue.description) {
      log(`\nDescription:\n${issue.description}`)
    }
    log('')
  }
}
