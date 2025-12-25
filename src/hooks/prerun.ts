import { Hook } from '@oclif/core'
import { checkDaemonConnection } from '../daemon/check-daemon-connection.js'

const EXCLUDED_COMMANDS = [
  'info',
  'shutdown',
  'restart',
  'start',
  'install',
  'install:daemon',
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
  }
}

export default hook
