/* eslint-disable single-export/single-export */

import type { IssueWithProject, PrWithProject } from '../../daemon/types.js'

export function formatIssueResults(
  issues: IssueWithProject[],
  log: (msg: string) => void
): void {
  for (const iwp of issues) {
    const issue = iwp.issue
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

export function formatPrResults(
  prs: PrWithProject[],
  log: (msg: string) => void
): void {
  for (const pwp of prs) {
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
}
