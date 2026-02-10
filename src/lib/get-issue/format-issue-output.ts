import type { Issue } from '../../daemon/types.js'

export function formatIssuePlain(
  issue: Issue,
  log: (msg: string) => void
): void {
  const meta = issue.metadata
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
}
