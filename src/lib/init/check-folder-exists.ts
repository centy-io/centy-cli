import { access, constants } from 'node:fs/promises'

/**
 * Check if a folder exists at the given path
 */
export async function checkFolderExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK)
    return true
  } catch {
    return false
  }
}
