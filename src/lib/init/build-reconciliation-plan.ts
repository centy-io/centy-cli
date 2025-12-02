import { access, constants } from 'node:fs/promises'
import { join } from 'node:path'
import type { CentyManifest } from '../../types/centy-manifest.js'
import type { ReconciliationPlan } from '../../types/reconciliation-plan.js'
import { computeFileHash } from '../../utils/compute-file-hash.js'
import { computeHash } from '../../utils/compute-hash.js'
import { findManagedFile } from '../../utils/find-managed-file.js'
import { getManagedFileContent } from './get-managed-file-content.js'
import { getManagedFilePaths } from './get-managed-file-paths.js'
import { getManagedFileType } from './get-managed-file-type.js'
import { isManagedFile } from './is-managed-file.js'
import { scanCentyFolder } from './scan-centy-folder.js'

/**
 * Build a reconciliation plan by comparing the current state
 * of the .centy folder against the manifest and templates
 */
export async function buildReconciliationPlan(
  centyPath: string,
  manifest: CentyManifest | null
): Promise<ReconciliationPlan> {
  const plan: ReconciliationPlan = {
    toCreate: [],
    toRestore: [],
    toReset: [],
    userFiles: [],
    upToDate: [],
  }

  const existingFiles = await scanCentyFolder(centyPath)
  const managedPaths = getManagedFilePaths()

  for (const path of managedPaths) {
    const fileExists = await checkFileExists(centyPath, path)
    const inManifest = manifest ? findManagedFile(manifest, path) : undefined
    const fileType = getManagedFileType(path)

    if (!fileExists && !inManifest) {
      // Fresh file, needs creation
      plan.toCreate.push(path)
    } else if (!fileExists && inManifest) {
      // Was managed, now deleted - ask user
      plan.toRestore.push({ path, wasInManifest: true })
    } else if (fileExists && !inManifest) {
      // File exists but no manifest entry (first init or legacy)
      if (fileType === 'directory') {
        // Directories are always up to date
        plan.upToDate.push(path)
      } else {
        const currentHash = await computeFileHash(join(centyPath, path))
        const templateContent = getManagedFileContent(path)
        const templateHash = templateContent ? computeHash(templateContent) : ''

        if (currentHash === templateHash) {
          // Matches template, just add to manifest
          plan.upToDate.push(path)
        } else {
          // Modified from template, ask user
          plan.toReset.push({ path, currentHash, originalHash: templateHash })
        }
      }
    } else if (fileExists && inManifest) {
      // Both exist, check if modified
      if (fileType === 'directory') {
        plan.upToDate.push(path)
      } else {
        const currentHash = await computeFileHash(join(centyPath, path))

        if (currentHash === inManifest.hash) {
          // Unchanged
          plan.upToDate.push(path)
        } else {
          // Modified since centy created it
          plan.toReset.push({
            path,
            currentHash,
            originalHash: inManifest.hash,
          })
        }
      }
    }
  }

  // Find user-created files
  for (const path of existingFiles) {
    if (!isManagedFile(path)) {
      plan.userFiles.push(path)
    }
  }

  return plan
}

async function checkFileExists(
  centyPath: string,
  path: string
): Promise<boolean> {
  try {
    // For directories, remove trailing slash
    const actualPath = path.endsWith('/')
      ? join(centyPath, path.slice(0, -1))
      : join(centyPath, path)
    await access(actualPath, constants.F_OK)
    return true
  } catch {
    return false
  }
}
