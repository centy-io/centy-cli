import type { SearchItemsResponse } from '../../daemon/types.js'

export function handleGlobalIssueSearch(
  result: SearchItemsResponse,
  uuid: string,
  log: (msg: string) => void,
  warn: (msg: string) => void
): void {
  if (result.items.length === 0) {
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

  for (const iwp of result.items) {
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

  if (result.errors.length === 0) {
    return
  }

  warn('Some projects could not be searched:')
  for (const err of result.errors) {
    warn(`  - ${err}`)
  }
}
