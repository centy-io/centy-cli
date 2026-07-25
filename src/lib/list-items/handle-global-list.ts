import { listItemsGlobally } from '../../daemon/daemon-list-items-globally.js'
import type { ItemWithProjectInfo } from '../../daemon/types.js'

export async function handleGlobalList(
  itemType: string,
  filter: string,
  limit: number,
  offset: number,
  jsonMode: boolean,
  log: (msg: string) => void,
  warn: (msg: string) => void
): Promise<void> {
  const result = await listItemsGlobally(itemType, filter, limit, offset)

  if (jsonMode) {
    const jsonItems = result.items.map(iwp => ({
      ...iwp.item,
      projectName: iwp.projectName,
      projectPath: iwp.projectPath,
    }))
    log(JSON.stringify(jsonItems, null, 2))
    return
  }

  if (result.items.length === 0) {
    log(`No ${itemType} found across projects.`)
    warnErrors(result.errors, warn)
    return
  }

  log(`Found ${result.items.length} ${itemType} across projects:\n`)

  for (const iwp of result.items) {
    formatItemLine(iwp, log)
  }

  warnErrors(result.errors, warn)
}

function formatItemLine(
  iwp: ItemWithProjectInfo,
  log: (msg: string) => void
): void {
  const { item, projectName } = iwp
  const meta = item.metadata
  if (meta === undefined) {
    log(`[${projectName}] ${item.title}`)
    return
  }
  const dn = meta.displayNumber > 0 ? `#${meta.displayNumber} ` : ''
  const status = meta.status !== '' ? ` [${meta.status}]` : ''
  const priority = meta.priority > 0 ? ` [P${meta.priority}]` : ''
  log(`[${projectName}] ${dn}${item.title}${status}${priority}`)
}

function warnErrors(errors: string[], warn: (msg: string) => void): void {
  if (errors.length === 0) return
  warn('Some projects could not be searched:')
  for (const err of errors) {
    warn(`  - ${err}`)
  }
}
