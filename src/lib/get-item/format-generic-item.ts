import type { GenericItem } from '../../daemon/types.js'

/**
 * Format a GenericItem for plain text output, adapting display based on item type
 */
export function formatGenericItem(
  item: GenericItem,
  log: (msg: string) => void
): void {
  const meta = item.metadata

  if (meta !== undefined && meta.displayNumber > 0) {
    log(`${capitalize(singularize(item.itemType))} #${meta.displayNumber}`)
  }

  log(`ID: ${item.id}`)
  log(`Title: ${item.title}`)

  if (meta !== undefined && meta.status !== '') {
    log(`Status: ${meta.status}`)
  }

  if (meta !== undefined && meta.priority > 0) {
    log(`Priority: P${meta.priority}`)
  }

  log(`Created: ${meta !== undefined ? meta.createdAt : 'unknown'}`)
  log(`Updated: ${meta !== undefined ? meta.updatedAt : 'unknown'}`)

  if (!item.body) {
    return
  }

  const label = item.itemType === 'docs' ? 'Content' : 'Description'
  log(`\n${label}:\n${item.body}`)
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function singularize(plural: string): string {
  if (plural.endsWith('ies')) return plural.slice(0, -3) + 'y'
  if (plural.endsWith('s')) return plural.slice(0, -1)
  return plural
}
