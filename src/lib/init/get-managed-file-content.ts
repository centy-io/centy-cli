import { MANAGED_FILES } from './managed-files.js'

/**
 * Get content for a managed file
 * Returns null for directories or unknown paths
 */
export function getManagedFileContent(path: string): string | null {
  const template = MANAGED_FILES[path]
  if (!template || template.type === 'directory') {
    return null
  }
  if (template.content === undefined) {
    return null
  }
  return template.content
}
