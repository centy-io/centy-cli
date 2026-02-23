import { Hook } from '@oclif/core'
import { checkDaemonConnection } from '../daemon/check-daemon-connection.js'
import { getProjectVersionStatus } from '../daemon/daemon-get-project-version.js'

const EXCLUDED_COMMANDS = [
  'info',
  'shutdown',
  'restart',
  'start',
  'daemon',
  'cockpit',
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

  // eslint-disable-next-line no-restricted-syntax
  const projectPath = process.env['CENTY_CWD'] ?? process.cwd()
  const versionStatus = await getProjectVersionStatus(projectPath)
  if (versionStatus !== null && versionStatus.isProjectBehind) {
    this.warn(
      `Your project is at version ${versionStatus.projectVersion}, daemon is at ${versionStatus.daemonVersion}. Run 'centy init' to migrate.`
    )
  }
}

export default hook
