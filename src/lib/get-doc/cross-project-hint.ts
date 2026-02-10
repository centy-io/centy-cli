/* eslint-disable single-export/single-export */

import { daemonGetDocsBySlug } from '../../daemon/daemon-get-docs-by-slug.js'
import {
  formatCrossProjectHint,
  formatCrossProjectJson,
  isNotFoundError,
} from '../../utils/cross-project-search.js'

export interface CrossProjectResult {
  hint: string | null
  jsonOutput: object | null
}

export async function checkCrossProjectDoc(
  error: unknown,
  slug: string,
  jsonMode: boolean
): Promise<CrossProjectResult> {
  if (!isNotFoundError(error)) {
    return { hint: null, jsonOutput: null }
  }

  const result = await daemonGetDocsBySlug({ slug })
  if (result.docs.length === 0) {
    return { hint: null, jsonOutput: null }
  }

  const matches = result.docs.map(dwp => ({
    projectName: dwp.projectName,
    projectPath: dwp.projectPath,
  }))

  if (jsonMode) {
    return {
      hint: null,
      jsonOutput: formatCrossProjectJson('doc', slug, matches),
    }
  }

  return {
    hint: formatCrossProjectHint('doc', slug, matches),
    jsonOutput: null,
  }
}
