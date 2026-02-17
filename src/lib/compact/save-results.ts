/* eslint-disable single-export/single-export */

import { daemonSaveMigration } from '../../daemon/daemon-save-migration.js'
import { daemonUpdateCompact } from '../../daemon/daemon-update-compact.js'
import { CompactSaveError } from './compact-save-error.js'

export async function saveMigration(
  projectPath: string,
  content: string
): Promise<{ filename: string }> {
  const response = await daemonSaveMigration({
    projectPath,
    content,
  })

  if (!response.success) {
    const detail = `Failed to save migration: ${response.error}`
    throw new CompactSaveError(detail)
  }

  return { filename: response.filename }
}

export async function saveCompact(
  projectPath: string,
  content: string
): Promise<void> {
  const response = await daemonUpdateCompact({
    projectPath,
    content,
  })

  if (response.success) {
    return
  }

  const detail = `Failed to update compact.md: ${response.error}`
  throw new CompactSaveError(detail)
}
