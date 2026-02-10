/* eslint-disable single-export/single-export */

import { daemonGetPrsByUuid } from '../../daemon/daemon-get-prs-by-uuid.js'
import {
  handleNotInitializedWithSearch,
  isValidUuid,
} from '../../utils/cross-project-search.js'

export interface NotInitializedResult {
  message: string
  jsonOutput?: unknown
}

export async function handlePrNotInitialized(
  error: unknown,
  id: string,
  jsonMode: boolean
): Promise<NotInitializedResult | null> {
  return handleNotInitializedWithSearch(error, {
    entityType: 'pr',
    identifier: id,
    jsonMode,
    shouldSearch: isValidUuid,
    async globalSearchFn() {
      const searchResult = await daemonGetPrsByUuid({ uuid: id })
      return {
        matches: searchResult.prs.map(pwp => ({
          projectName: pwp.projectName,
          projectPath: pwp.projectPath,
        })),
        errors: searchResult.errors,
      }
    },
  })
}
