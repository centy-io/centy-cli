import type { GlobalItemSearchResult } from './types.js'
import { daemonGetItem } from './daemon-get-item.js'
import { daemonListProjects } from './daemon-list-projects.js'

/**
 * Search for items by display number across all registered projects.
 * Iterates each initialized project and calls GetItem with the display number.
 */
export async function searchItemsByDisplayNumberGlobally(
  itemType: string,
  displayNumber: number
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
        const response = await daemonGetItem({
          projectPath: project.path,
          itemType,
          itemId: '',
          displayNumber,
        })

        if (response.success && response.item) {
          items.push({
            item: response.item,
            projectPath: project.path,
            projectName: project.name,
            displayPath: project.displayPath,
          })
        }
      } catch (err) {
        errors.push(`${project.path}: ${String(err)}`)
      }
    })
  )

  return { items, errors }
}
