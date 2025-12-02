import { MANAGED_FILES } from './managed-files.js'

/**
 * Get all managed file paths
 */
export function getManagedFilePaths(): string[] {
  return Object.keys(MANAGED_FILES)
}
