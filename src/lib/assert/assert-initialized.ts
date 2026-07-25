import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'

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
 * Assert that the project at projectPath is initialized with a .centy folder.
 * Throws NotInitializedError if not initialized.
 * @returns The path to the .centy folder
 */
export async function assertInitialized(projectPath: string): Promise<string> {
  const status = await daemonIsInitialized({ projectPath })
  if (!status.initialized) {
    throw new NotInitializedError(projectPath)
  }
  return status.centyPath
}
