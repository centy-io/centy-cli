/* eslint-disable single-export/single-export */

import { daemonGetIssuesByUuid } from '../../daemon/daemon-get-issues-by-uuid.js'
import type { SearchItemsResponse } from '../../daemon/types.js'

export interface EntitySearchResult {
  issuesResult: SearchItemsResponse
}

export async function searchEntitiesByUuid(
  uuid: string
): Promise<EntitySearchResult> {
  const issuesResult = await daemonGetIssuesByUuid({ uuid })

  return { issuesResult }
}
