/* eslint-disable single-export/single-export */

import { daemonGetDocsBySlug } from '../../daemon/daemon-get-docs-by-slug.js'
import { handleNotInitializedWithSearch } from '../../utils/cross-project-search.js'

export interface NotInitializedResult {
  message: string
  jsonOutput?: unknown
}

export async function handleDocNotInitialized(
  error: unknown,
  slug: string,
  jsonMode: boolean
): Promise<NotInitializedResult | null> {
  return handleNotInitializedWithSearch(error, {
    entityType: 'doc',
    identifier: slug,
    jsonMode,
    async globalSearchFn() {
      const searchResult = await daemonGetDocsBySlug({ slug })
      return {
        matches: searchResult.docs.map(dwp => ({
          projectName: dwp.projectName,
          projectPath: dwp.projectPath,
        })),
        errors: searchResult.errors,
      }
    },
  })
}
