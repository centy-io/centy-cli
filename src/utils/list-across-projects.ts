/**
 * Utility for listing entities across all tracked projects
 */
import { daemonListProjects } from '../daemon/daemon-list-projects.js'

interface EntityWithProject<T> {
  entity: T
  projectName: string
  projectPath: string
}

interface ListAcrossProjectsResult<T> {
  items: EntityWithProject<T>[]
  errors: string[]
}

interface ListAcrossProjectsOptions<T> {
  listFn: (projectPath: string) => Promise<T[]>
}

/**
 * Lists entities across all tracked, initialized projects
 */
export async function listAcrossProjects<T>(
  options: ListAcrossProjectsOptions<T>
): Promise<ListAcrossProjectsResult<T>> {
  const projectsResponse = await daemonListProjects({
    includeUninitialized: false,
    includeStale: false,
    includeArchived: false,
  })

  const items: EntityWithProject<T>[] = []
  const errors: string[] = []

  for (const project of projectsResponse.projects) {
    try {
      const entities = await options.listFn(project.path)
      for (const entity of entities) {
        items.push({
          entity,
          projectName: project.name,
          projectPath: project.path,
        })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errors.push(`${project.name}: ${errorMsg}`)
    }
  }

  return { items, errors }
}
