/* eslint-disable single-export/single-export */

import { daemonGetIssuesByUuid } from '../../daemon/daemon-get-issues-by-uuid.js'
import {
  formatCrossProjectHint,
  formatCrossProjectJson,
  isNotFoundError,
  isValidUuid,
} from '../../utils/cross-project-search.js'

export interface CrossProjectResult {
  hint: string | null
  jsonOutput: object | null
}

export async function checkCrossProjectIssue(
  error: unknown,
  id: string,
  isDisplayNumber: boolean,
  jsonMode: boolean
): Promise<CrossProjectResult> {
  if (isDisplayNumber || !isNotFoundError(error) || !isValidUuid(id)) {
    return { hint: null, jsonOutput: null }
  }

  const result = await daemonGetIssuesByUuid({ uuid: id })
  if (result.issues.length === 0) {
    return { hint: null, jsonOutput: null }
  }

  const matches = result.issues.map(iwp => ({
    projectName: iwp.projectName,
    projectPath: iwp.projectPath,
  }))

  if (jsonMode) {
    return {
      hint: null,
      jsonOutput: formatCrossProjectJson('issue', id, matches),
    }
  }

  return {
    hint: formatCrossProjectHint('issue', id, matches),
    jsonOutput: null,
  }
}
