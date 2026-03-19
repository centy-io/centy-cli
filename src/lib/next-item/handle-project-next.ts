import { daemonListItems } from '../../daemon/daemon-list-items.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'

export async function handleProjectNext(
  cwd: string,
  itemType: string,
  singularType: string,
  filter: string,
  status: string,
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
    limit: 1,
    offset: 0,
  })

  if (!response.success) {
    error(response.error)
  }

  if (response.items.length === 0) {
    log(`No ${status} ${singularType} found.`)
    return
  }

  const item = response.items[0]

  if (jsonMode) {
    log(JSON.stringify(item, null, 2))
    return
  }

  const meta = item.metadata
  const dn =
    meta !== undefined && meta.displayNumber > 0
      ? `#${meta.displayNumber} `
      : ''
  const statusLabel =
    meta !== undefined && meta.status !== '' ? ` [${meta.status}]` : ''
  const priority =
    meta !== undefined && meta.priority > 0 ? ` [P${meta.priority}]` : ''
  log(`${dn}${item.title}${statusLabel}${priority}`)

  if (item.body) {
    log(`\n${item.body}`)
  }
}
