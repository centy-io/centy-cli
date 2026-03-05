import type { ItemWithProject } from '../../daemon/types.js'

export function formatIssueResults(
  issues: ItemWithProject[],
  log: (msg: string) => void
): void {
  for (const iwp of issues) {
    const issue = iwp.item!
    const meta = issue.metadata
    log(`--- Project: ${iwp.projectName} (${iwp.projectPath}) ---`)
    log(`Issue #${meta !== undefined ? meta.displayNumber : 0}`)
    log(`ID: ${issue.id}`)
    log(`Title: ${issue.title}`)
    log(`Status: ${meta !== undefined ? meta.status : 'unknown'}`)
    log(`Priority: ${meta !== undefined ? `P${meta.priority}` : 'P?'}`)
    log(`Created: ${meta !== undefined ? meta.createdAt : 'unknown'}`)
    log(`Updated: ${meta !== undefined ? meta.updatedAt : 'unknown'}`)
    if (issue.body) {
      log(`\nDescription:\n${issue.body}`)
    }
    log('')
  }
}
