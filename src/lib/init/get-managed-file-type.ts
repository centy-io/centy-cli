import { MANAGED_FILES } from './managed-files.js'

/**
 * Get the type of a managed file
 */
export function getManagedFileType(path: string): 'file' | 'directory' | null {
  const template = MANAGED_FILES[path]
  if (!template) {
    return null
  }
  return template.type
}
