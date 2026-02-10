/* eslint-disable single-export/single-export */

import { daemonGetIssuesByUuid } from '../../daemon/daemon-get-issues-by-uuid.js'
import { daemonGetPrsByUuid } from '../../daemon/daemon-get-prs-by-uuid.js'
import type {
  GetIssuesByUuidResponse,
  GetPrsByUuidResponse,
} from '../../daemon/types.js'

export interface EntitySearchResult {
  issuesResult: GetIssuesByUuidResponse
  prsResult: GetPrsByUuidResponse
}

export async function searchEntitiesByUuid(
  uuid: string
): Promise<EntitySearchResult> {
  const [issuesResult, prsResult] = await Promise.all([
    daemonGetIssuesByUuid({ uuid }),
    daemonGetPrsByUuid({ uuid }),
  ])

  return { issuesResult, prsResult }
}
