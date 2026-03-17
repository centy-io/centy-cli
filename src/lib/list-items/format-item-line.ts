import type { GenericItem } from '../../daemon/types.js'

/**
 * Format a single GenericItem as a one-line summary string
 */
export function formatItemLine(item: GenericItem): string {
  const meta = item.metadata
  const num =
    meta !== undefined && meta.displayNumber > 0
      ? `#${meta.displayNumber} `
      : ''
  const status =
    meta !== undefined && meta.status !== '' ? ` [${meta.status}]` : ''
  const priority =
    meta !== undefined && meta.priority > 0 ? ` P${meta.priority}` : ''
  return `${num}${item.title}${status}${priority}`
}
