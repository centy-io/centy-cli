import type { GlobalItemSearchResult } from './types.js'
import { daemonListItems } from './daemon-list-items.js'
import { daemonListProjects } from './daemon-list-projects.js'

/**
 * List items across all registered projects.
 * Iterates each initialized project and calls ListItems with the given filters.
 */
export async function listItemsGlobally(
  itemType: string,
  filter: string,
  limit: number,
  offset: number
): Promise<GlobalItemSearchResult> {
  const projectsResponse = await daemonListProjects({
    includeStale: false,
    includeUninitialized: false,
    includeArchived: false,
    organizationSlug: '',
    ungroupedOnly: false,
    includeTemp: false,
  })

  const items: GlobalItemSearchResult['items'] = []
  const errors: string[] = []

  await Promise.all(
    projectsResponse.projects.map(async project => {
      if (!project.initialized) return

      try {
        const response = await daemonListItems({
          projectPath: project.path,
          itemType,
          filter,
          limit: 0,
          offset: 0,
        })

        if (response.success) {
          for (const item of response.items) {
            items.push({
              item,
              projectPath: project.path,
              projectName: project.name,
              displayPath: project.displayPath,
            })
          }
        }
      } catch (err) {
        errors.push(`${project.path}: ${String(err)}`)
      }
    })
  )

  items.sort((a, b) => {
    const aTime = a.item.metadata !== undefined ? a.item.metadata.createdAt : ''
    const bTime = b.item.metadata !== undefined ? b.item.metadata.createdAt : ''
    return bTime.localeCompare(aTime)
  })

  const sliced =
    offset > 0 || limit > 0
      ? items.slice(offset, limit > 0 ? offset + limit : undefined)
      : items

  return { items: sliced, errors }
}
