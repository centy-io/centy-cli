import { daemonListItems } from '../../daemon/daemon-list-items.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'

export async function handleProjectList(
  cwd: string,
  itemType: string,
  filter: string,
  limit: number,
  offset: number,
  jsonMode: boolean,
  log: (msg: string) => void,
  error: (msg: string) => never
): Promise<void> {
  try {
    await ensureInitialized(cwd)
  } catch (err) {
    if (err instanceof NotInitializedError) {
      error(err.message)
    }
    throw err instanceof Error ? err : new Error(String(err))
  }

  const response = await daemonListItems({
    projectPath: cwd,
    itemType,
    filter,
    limit,
    offset,
  })

  if (!response.success) {
    error(response.error)
  }

  if (jsonMode) {
    log(JSON.stringify(response.items, null, 2))
    return
  }

  if (response.items.length === 0) {
    log(`No ${itemType} found.`)
    return
  }

  log(`Found ${response.totalCount} ${itemType}:\n`)
  for (const item of response.items) {
    const meta = item.metadata
    if (meta === undefined) {
      log(item.title)
      continue
    }
    const dn = meta.displayNumber > 0 ? `#${meta.displayNumber} ` : ''
    const status = meta.status !== '' ? ` [${meta.status}]` : ''
    const priority = meta.priority > 0 ? ` [P${meta.priority}]` : ''
    log(`${dn}${item.title}${status}${priority}`)
  }
}
