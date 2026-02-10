/* eslint-disable single-export/single-export */

import { daemonGetPrsByUuid } from '../../daemon/daemon-get-prs-by-uuid.js'
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

export async function checkCrossProjectPr(
  error: unknown,
  id: string,
  isDisplayNumber: boolean,
  jsonMode: boolean
): Promise<CrossProjectResult> {
  if (isDisplayNumber || !isNotFoundError(error) || !isValidUuid(id)) {
    return { hint: null, jsonOutput: null }
  }

  const result = await daemonGetPrsByUuid({ uuid: id })
  if (result.prs.length === 0) {
    return { hint: null, jsonOutput: null }
  }

  const matches = result.prs.map(pwp => ({
    projectName: pwp.projectName,
    projectPath: pwp.projectPath,
  }))

  if (jsonMode) {
    return {
      hint: null,
      jsonOutput: formatCrossProjectJson('pr', id, matches),
    }
  }

  return { hint: formatCrossProjectHint('pr', id, matches), jsonOutput: null }
}
