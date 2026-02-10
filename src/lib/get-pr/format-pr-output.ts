import type { PullRequest } from '../../daemon/types.js'

export function formatPrPlain(
  pr: PullRequest,
  log: (msg: string) => void
): void {
  const meta = pr.metadata
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
  if (meta !== undefined && meta.reviewers.length > 0) {
    log(`Reviewers: ${meta.reviewers.join(', ')}`)
  }
  log(`Created: ${meta !== undefined ? meta.createdAt : 'unknown'}`)
  log(`Updated: ${meta !== undefined ? meta.updatedAt : 'unknown'}`)
  if (meta !== undefined && meta.mergedAt !== '') {
    log(`Merged: ${meta.mergedAt}`)
  }
  if (meta !== undefined && meta.closedAt !== '') {
    log(`Closed: ${meta.closedAt}`)
  }
  if (pr.description) {
    log(`\nDescription:\n${pr.description}`)
  }
}
