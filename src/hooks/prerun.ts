import { Hook } from '@oclif/core'
import { checkDaemonConnection } from '../daemon/check-daemon-connection.js'
import { getProjectVersionStatus } from '../daemon/daemon-get-project-version.js'
import { assertInitialized, NotInitializedError } from '../lib/assert/index.js'

const EXCLUDED_COMMANDS = [
  'info',
  'shutdown',
  'restart',
  'start',
  'daemon',
  'cockpit',
]

/**
 * Commands that do not require a .centy folder to be present.
 * Extends EXCLUDED_COMMANDS with commands that set up or observe
 * the project without needing it to already be initialized.
 */
const INIT_EXEMPT_COMMANDS = [
  ...EXCLUDED_COMMANDS,
  'init',
  'version',
  'register',
]

const hook: Hook<'prerun'> = async function (options) {
  const commandId = options.Command.id
  const isExcluded = EXCLUDED_COMMANDS.some(
    cmd => commandId === cmd || commandId.startsWith(`${cmd}:`)
  )
  if (isExcluded) {
    return
  }

  const connectionStatus = await checkDaemonConnection()
  if (!connectionStatus.connected) {
    const errorMessage =
      connectionStatus.error !== null && connectionStatus.error !== undefined
        ? connectionStatus.error
        : 'Centy daemon is not running. Please start the daemon first.'
    this.error(errorMessage)
    return
  }


  const projectPath = process.env['CENTY_CWD'] ?? process.cwd()
  const versionStatus = await getProjectVersionStatus(projectPath)
  if (versionStatus !== null && versionStatus.isProjectBehind) {
    this.warn(
      `Your project is at version ${versionStatus.projectVersion}, daemon is at ${versionStatus.daemonVersion}. Run 'centy init' to migrate.`
    )
  }

  // Check that the project is initialized before running repo-context commands.
  // Skip for init-exempt commands and when --project is supplied (the command
  // resolves its own path and performs its own assertion for that path).
  const isInitExempt = INIT_EXEMPT_COMMANDS.some(
    cmd => commandId === cmd || commandId.startsWith(`${cmd}:`)
  )

  const argv =
    options.argv !== null && options.argv !== undefined ? options.argv : []
  const hasProjectFlag = argv.some(arg => arg === '--project')
  if (!isInitExempt && !hasProjectFlag) {
    try {
      await assertInitialized(projectPath)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
        return
      }
      throw error instanceof Error ? error : new Error(String(error))
    }
  }
}

export default hook
