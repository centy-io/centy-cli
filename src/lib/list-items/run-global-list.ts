import type { Command } from '@oclif/core'
import { listItemsGlobally } from '../../daemon/daemon-list-items-globally.js'
import { formatItemLine } from './format-item-line.js'

/* eslint-disable single-export/single-export */
export function buildFilter(
  status: string | undefined,
  priority: number | undefined
): string {
  const filterObj: Record<string, unknown> = {}
  if (status !== undefined) filterObj['status'] = status
  if (priority !== undefined) filterObj['priority'] = priority
  return Object.keys(filterObj).length > 0 ? JSON.stringify(filterObj) : ''
}

export async function runGlobalList(
  cmd: Pick<Command, 'log'>,
  itemType: string,
  filter: string,
  limit: number,
  offset: number,
  json: boolean
): Promise<void> {
  const result = await listItemsGlobally(itemType, filter, limit, offset)

  if (json) {
    cmd.log(
      JSON.stringify(
        result.items.map(({ item, projectName, projectPath }) => ({
          ...item,
          projectName,
          projectPath,
        })),
        null,
        2
      )
    )
    return
  }

  if (result.items.length === 0) {
    cmd.log(`No ${itemType} found.`)
    return
  }

  cmd.log(`Found ${result.items.length} ${itemType}:\n`)
  for (const { item, projectName } of result.items) {
    cmd.log(`[${projectName}] ${formatItemLine(item)}\n  ID: ${item.id}`)
  }
}
