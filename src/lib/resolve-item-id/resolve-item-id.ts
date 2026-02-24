import { daemonGetItem } from '../../daemon/daemon-get-item.js'
import { parseDisplayNumber } from './parse-display-number.js'

/**
 * Resolve an item identifier to a UUID.
 * If the id is a numeric display number, looks up the UUID via daemon.
 * Otherwise returns the id as-is (already a UUID or slug).
 */
export async function resolveItemId(
  id: string,
  itemType: string,
  projectPath: string,
  throwError: (msg: string) => never
): Promise<string> {
  const displayNumber = parseDisplayNumber(id)
  if (displayNumber === undefined) {
    return id
  }
  const getResponse = await daemonGetItem({
    projectPath,
    itemType,
    itemId: '',
    displayNumber,
  })
  if (!getResponse.success) {
    throwError(`Item not found: ${id}`)
  }
  return getResponse.item!.id
}
