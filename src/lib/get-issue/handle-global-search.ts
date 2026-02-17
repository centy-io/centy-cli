import type { GetIssuesByUuidResponse } from '../../daemon/types.js'

export function handleGlobalIssueSearch(
  result: GetIssuesByUuidResponse,
  uuid: string,
  log: (msg: string) => void,
  warn: (msg: string) => void
): void {
  if (result.issues.length === 0) {
    log(`No issues found with UUID: ${uuid}`)
    if (result.errors.length > 0) {
      warn('Some projects could not be searched:')
      for (const err of result.errors) {
        warn(`  - ${err}`)
      }
    }
    return
  }

  log(`Found ${result.totalCount} issue(s) matching UUID: ${uuid}\n`)

  for (const iwp of result.issues) {
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

  if (result.errors.length === 0) {
    return
  }

  warn('Some projects could not be searched:')
  for (const err of result.errors) {
    warn(`  - ${err}`)
  }
}
