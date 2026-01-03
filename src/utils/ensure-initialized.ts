/* eslint-disable single-export/single-export */
/**
 * Initialization check utilities
 * Multiple exports allowed for related error class and function
 */
import { daemonIsInitialized } from '../daemon/daemon-is-initialized.js'

export class NotInitializedError extends Error {
  constructor(cwd: string) {
    super(
      `No .centy folder found in '${cwd}'.\n` +
        `Either navigate to a directory with an initialized .centy folder, or run "centy init" to create one here.`
    )
    this.name = 'NotInitializedError'
  }
}

/**
 * Ensure the project is initialized with a .centy folder.
 * Throws NotInitializedError if not initialized.
 * @returns The path to the .centy folder
 */
export async function ensureInitialized(cwd: string): Promise<string> {
  const initStatus = await daemonIsInitialized({ projectPath: cwd })
  if (!initStatus.initialized) {
    throw new NotInitializedError(cwd)
  }
  return initStatus.centyPath
}
