
import { daemonGetIssueByDisplayNumber } from '../../daemon/daemon-get-issue-by-display-number.js'

export type EntityType = 'issue'

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
      displayNumber:
        issue.metadata !== undefined ? issue.metadata.displayNumber : 0,
    })
  } catch {
    // Issue not found, continue
  }

  return foundEntities
}
