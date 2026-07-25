import type { GlobalItemSearchResult } from './types.js'
import { daemonListItemsAcrossProjects } from './daemon-list-items-across-projects.js'

/**
 * List items across all registered projects via the ListItemsAcrossProjects RPC.
 */
export async function listItemsGlobally(
  itemType: string,
  filter: string,
  limit: number,
  offset: number
): Promise<GlobalItemSearchResult> {
  const response = await daemonListItemsAcrossProjects({
    itemType,
    filter,
    limit,
    offset,
  })

  return {
    items: response.items.map(entry => ({
      item: entry.item!,
      projectPath: entry.projectPath,
      projectName: entry.projectName,
      displayPath: entry.displayPath,
    })),
    errors: response.errors,
  }
}
