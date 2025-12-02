import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CentyManifest } from '../../types/centy-manifest.js'
import type { ManagedFile } from '../../types/managed-file.js'
import type { ReconciliationDecisions } from '../../types/reconciliation-decisions.js'
import type { ReconciliationPlan } from '../../types/reconciliation-plan.js'
import { addFileToManifest } from '../../utils/add-file-to-manifest.js'
import { computeHash } from '../../utils/compute-hash.js'
import { VERSION } from '../../version.js'
import { getManagedFileContent } from './get-managed-file-content.js'
import { getManagedFileType } from './get-managed-file-type.js'

/**
 * Execute the reconciliation plan based on user decisions
 * Returns the updated manifest
 */
export async function executeReconciliation(
  centyPath: string,
  plan: ReconciliationPlan,
  decisions: ReconciliationDecisions,
  manifest: CentyManifest
): Promise<CentyManifest> {
  let updatedManifest = manifest

  // Create new files
  for (const path of plan.toCreate) {
    await createManagedFile(centyPath, path)
    updatedManifest = addFileToManifest(
      updatedManifest,
      createManagedFileEntry(path)
    )
  }

  // Restore deleted files (user confirmed)
  for (const path of decisions.restore) {
    await createManagedFile(centyPath, path)
    updatedManifest = addFileToManifest(
      updatedManifest,
      createManagedFileEntry(path)
    )
  }

  // Reset modified files (user confirmed)
  for (const path of decisions.reset) {
    await createManagedFile(centyPath, path)
    // Update the manifest entry with new hash
    updatedManifest = {
      ...updatedManifest,
      updatedAt: new Date().toISOString(),
      managedFiles: updatedManifest.managedFiles.map(f =>
        f.path === path ? createManagedFileEntry(path) : f
      ),
    }
  }

  // Add up-to-date files to manifest if not already there
  for (const path of plan.upToDate) {
    const exists = updatedManifest.managedFiles.some(f => f.path === path)
    if (!exists) {
      updatedManifest = addFileToManifest(
        updatedManifest,
        createManagedFileEntry(path)
      )
    }
  }

  return updatedManifest
}

async function createManagedFile(
  centyPath: string,
  path: string
): Promise<void> {
  const fileType = getManagedFileType(path)

  if (fileType === 'directory') {
    // Remove trailing slash and create directory
    const dirPath = join(centyPath, path.slice(0, -1))
    await mkdir(dirPath, { recursive: true })
  } else {
    const content = getManagedFileContent(path)
    const filePath = join(centyPath, path)
    await writeFile(filePath, content !== null ? content : '', 'utf8')
  }
}

function createManagedFileEntry(path: string): ManagedFile {
  const fileType = getManagedFileType(path)
  const content = getManagedFileContent(path)

  return {
    path,
    hash: content ? computeHash(content) : '',
    version: VERSION,
    createdAt: new Date().toISOString(),
    type: fileType !== null ? fileType : 'file',
  }
}
