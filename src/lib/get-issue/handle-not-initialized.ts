/* eslint-disable single-export/single-export */

import { daemonGetIssuesByUuid } from '../../daemon/daemon-get-issues-by-uuid.js'
import {
  handleNotInitializedWithSearch,
  isValidUuid,
} from '../../utils/cross-project-search.js'

export interface NotInitializedResult {
  message: string
  jsonOutput?: unknown
}

export async function handleIssueNotInitialized(
  error: unknown,
  id: string,
  jsonMode: boolean
): Promise<NotInitializedResult | null> {
  return handleNotInitializedWithSearch(error, {
    entityType: 'issue',
    identifier: id,
    jsonMode,
    shouldSearch: isValidUuid,
    async globalSearchFn() {
      const searchResult = await daemonGetIssuesByUuid({ uuid: id })
      return {
        matches: searchResult.issues.map(iwp => ({
          projectName: iwp.projectName,
          projectPath: iwp.projectPath,
        })),
        errors: searchResult.errors,
      }
    },
  })
}
