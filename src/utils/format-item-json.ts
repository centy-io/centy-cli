import type { GenericItem } from '../daemon/generated/centy/v1/generic_item.js'

/**
 * Format a GenericItem as a JSON-serializable object for --json output.
 */
export function formatItemJson(
  type: string,
  item: GenericItem
): Record<string, unknown> {
  const meta = item.metadata
  return {
    type,
    id: item.id,
    displayNumber:
      meta !== undefined && meta.displayNumber > 0
        ? meta.displayNumber
        : undefined,
    title: item.title,
    status: meta !== undefined ? meta.status : undefined,
  }
}
