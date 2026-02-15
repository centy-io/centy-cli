/* eslint-disable single-export/single-export */

import { daemonGetIssuesByUuid } from '../../daemon/daemon-get-issues-by-uuid.js'
import type { GetIssuesByUuidResponse } from '../../daemon/types.js'

export interface EntitySearchResult {
  issuesResult: GetIssuesByUuidResponse
}

export async function searchEntitiesByUuid(
  uuid: string
): Promise<EntitySearchResult> {
  const issuesResult = await daemonGetIssuesByUuid({ uuid })

  return { issuesResult }
}
