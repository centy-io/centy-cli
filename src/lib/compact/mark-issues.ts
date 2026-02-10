/* eslint-disable single-export/single-export */

import { daemonMarkIssuesCompacted } from '../../daemon/daemon-mark-issues-compacted.js'
import { CompactSaveError } from './compact-save-error.js'

export interface MarkIssuesResult {
  markedCount: number
  noIdsFound: boolean
}

export async function extractAndMarkIssues(
  projectPath: string,
  content: string
): Promise<MarkIssuesResult> {
  const idMatches = content.matchAll(
    /(?:id|issueId):\s*["']?([a-f0-9-]{36})["']?/gi
  )
  const issueIds: string[] = []

  for (const match of idMatches) {
    if (!issueIds.includes(match[1])) {
      issueIds.push(match[1])
    }
  }

  if (issueIds.length === 0) {
    return { markedCount: 0, noIdsFound: true }
  }

  const response = await daemonMarkIssuesCompacted({
    projectPath,
    issueIds,
  })

  if (!response.success) {
    throw new CompactSaveError(
      `Failed to mark issues as compacted: ${response.error}`
    )
  }

  return { markedCount: response.markedCount, noIdsFound: false }
}
