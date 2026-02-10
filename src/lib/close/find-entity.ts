/* eslint-disable single-export/single-export */

import { daemonGetIssueByDisplayNumber } from '../../daemon/daemon-get-issue-by-display-number.js'
import { daemonGetPrByDisplayNumber } from '../../daemon/daemon-get-pr-by-display-number.js'

export type EntityType = 'issue' | 'pr'

export interface FoundEntity {
  type: EntityType
  id: string
  displayNumber: number
}

export async function findEntityByDisplayNumber(
  projectPath: string,
  displayNumber: number
): Promise<FoundEntity[]> {
  const foundEntities: FoundEntity[] = []

  try {
    const issue = await daemonGetIssueByDisplayNumber({
      projectPath,
      displayNumber,
    })
    foundEntities.push({
      type: 'issue',
      id: issue.id,
      displayNumber: issue.displayNumber,
    })
  } catch {
    // Issue not found, continue
  }

  try {
    const pr = await daemonGetPrByDisplayNumber({
      projectPath,
      displayNumber,
    })
    foundEntities.push({
      type: 'pr',
      id: pr.id,
      displayNumber: pr.displayNumber,
    })
  } catch {
    // PR not found, continue
  }

  return foundEntities
}
