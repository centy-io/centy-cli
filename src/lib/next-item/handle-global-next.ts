import { listItemsGlobally } from '../../daemon/daemon-list-items-globally.js'

export async function handleGlobalNext(
  itemType: string,
  singularType: string,
  filter: string,
  status: string,
  jsonMode: boolean,
  log: (msg: string) => void
): Promise<void> {
  const result = await listItemsGlobally(itemType, filter, 1, 0)

  if (result.items.length === 0) {
    log(`No ${status} ${singularType} found across projects.`)
    return
  }

  const { item, projectName, projectPath } = result.items[0]

  if (jsonMode) {
    log(JSON.stringify({ ...item, projectName, projectPath }, null, 2))
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
  log(`[${projectName}] ${dn}${item.title}${statusLabel}${priority}`)

  if (item.body) {
    log(`\n${item.body}`)
  }
}
