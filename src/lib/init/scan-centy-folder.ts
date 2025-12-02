import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Scan the .centy folder and return all paths (files and directories)
 * Directories are returned with trailing slash
 */
export async function scanCentyFolder(centyPath: string): Promise<string[]> {
  try {
    const entries = await readdir(centyPath, { withFileTypes: true })
    const paths: string[] = []

    for (const entry of entries) {
      if (entry.name === '.centy-manifest.json') {
        continue // Skip manifest file
      }
      if (entry.isDirectory()) {
        paths.push(`${entry.name}/`)
        // Recursively scan subdirectories
        const subPaths = await scanSubdirectory(
          join(centyPath, entry.name),
          `${entry.name}/`
        )
        paths.push(...subPaths)
      } else {
        paths.push(entry.name)
      }
    }

    return paths
  } catch {
    return []
  }
}

async function scanSubdirectory(
  dirPath: string,
  prefix: string
): Promise<string[]> {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true })
    const paths: string[] = []

    for (const entry of entries) {
      if (entry.isDirectory()) {
        paths.push(`${prefix}${entry.name}/`)
        const subPaths = await scanSubdirectory(
          join(dirPath, entry.name),
          `${prefix}${entry.name}/`
        )
        paths.push(...subPaths)
      } else {
        paths.push(`${prefix}${entry.name}`)
      }
    }

    return paths
  } catch {
    return []
  }
}
