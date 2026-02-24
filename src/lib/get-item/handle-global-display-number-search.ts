import type { GlobalItemSearchResult } from '../../daemon/types.js'

export function handleGlobalDisplayNumberSearch(
  result: GlobalItemSearchResult,
  displayNumber: number,
  log: (msg: string) => void,
  warn: (msg: string) => void
): void {
  if (result.items.length === 0) {
    log(`No issues found with display number: #${displayNumber}`)
    if (result.errors.length > 0) {
      warn('Some projects could not be searched:')
      for (const err of result.errors) {
        warn(`  - ${err}`)
      }
    }
    return
  }

  log(`Found ${result.items.length} issue(s) matching #${displayNumber}\n`)

  for (const iwp of result.items) {
    const item = iwp.item
    const meta = item.metadata
    log(`--- Project: ${iwp.projectName} (${iwp.projectPath}) ---`)
    log(`Issue #${meta !== undefined ? meta.displayNumber : displayNumber}`)
    log(`ID: ${item.id}`)
    log(`Title: ${item.title}`)
    log(`Status: ${meta !== undefined ? meta.status : 'unknown'}`)
    log(
      `Priority: ${meta !== undefined && meta.priority > 0 ? `P${meta.priority}` : 'none'}`
    )
    log(`Created: ${meta !== undefined ? meta.createdAt : 'unknown'}`)
    log(`Updated: ${meta !== undefined ? meta.updatedAt : 'unknown'}`)
    if (item.body) {
      log(`\nDescription:\n${item.body}`)
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
