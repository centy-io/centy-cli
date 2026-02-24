import { searchItemsByDisplayNumberGlobally } from '../../daemon/daemon-search-items-globally.js'
import { daemonGetIssuesByUuid } from '../../daemon/daemon-get-issues-by-uuid.js'
import { isValidUuid } from '../../utils/cross-project-search.js'
import { handleGlobalIssueSearch } from '../get-issue/handle-global-search.js'
import { handleGlobalDisplayNumberSearch } from './handle-global-display-number-search.js'

export async function handleGlobalGet(
  itemType: string,
  id: string,
  jsonMode: boolean,
  log: (msg: string) => void,
  warn: (msg: string) => void,
  error: (msg: string) => never
): Promise<void> {
  if (itemType !== 'issues') {
    error('Global search is currently only supported for issues.')
  }

  const displayNumber = /^\d+$/.test(id) ? Number(id) : undefined

  if (displayNumber !== undefined) {
    const result = await searchItemsByDisplayNumberGlobally(itemType, displayNumber)
    if (jsonMode) {
      log(JSON.stringify(result, null, 2))
      return
    }
    handleGlobalDisplayNumberSearch(result, displayNumber, log, warn)
    return
  }

  if (!isValidUuid(id)) {
    error(
      'Global search requires a display number or a valid UUID.'
    )
  }

  const result = await daemonGetIssuesByUuid({ uuid: id })
  if (jsonMode) {
    log(JSON.stringify(result, null, 2))
    return
  }

  handleGlobalIssueSearch(result, id, log, warn)
}
