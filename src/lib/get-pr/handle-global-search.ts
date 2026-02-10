import type { GetPrsByUuidResponse } from '../../daemon/types.js'

export function handleGlobalPrSearch(
  result: GetPrsByUuidResponse,
  uuid: string,
  log: (msg: string) => void,
  warn: (msg: string) => void
): void {
  if (result.prs.length === 0) {
    log(`No PRs found with UUID: ${uuid}`)
    if (result.errors.length > 0) {
      warn('Some projects could not be searched:')
      for (const err of result.errors) {
        warn(`  - ${err}`)
      }
    }
    return
  }

  log(`Found ${result.totalCount} PR(s) matching UUID: ${uuid}\n`)

  for (const pwp of result.prs) {
    const pr = pwp.pr
    const meta = pr.metadata
    log(`--- Project: ${pwp.projectName} (${pwp.projectPath}) ---`)
    log(`PR #${pr.displayNumber}`)
    log(`ID: ${pr.id}`)
    log(`Title: ${pr.title}`)
    log(`Status: ${meta !== undefined ? meta.status : 'unknown'}`)
    log(
      `Priority: ${meta !== undefined ? (meta.priorityLabel !== '' ? meta.priorityLabel : `P${meta.priority}`) : 'P?'}`
    )
    log(
      `Branch: ${meta !== undefined ? `${meta.sourceBranch} -> ${meta.targetBranch}` : '? -> ?'}`
    )
    log(`Created: ${meta !== undefined ? meta.createdAt : 'unknown'}`)
    log(`Updated: ${meta !== undefined ? meta.updatedAt : 'unknown'}`)
    if (pr.description) {
      log(`\nDescription:\n${pr.description}`)
    }
    log('')
  }

  if (result.errors.length > 0) {
    warn('Some projects could not be searched:')
    for (const err of result.errors) {
      warn(`  - ${err}`)
    }
  }
}
