import { MANAGED_FILES } from './managed-files.js'

/**
 * Check if a path is a managed file
 */
export function isManagedFile(path: string): boolean {
  return path in MANAGED_FILES
}
