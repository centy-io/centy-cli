import { Command, Flags } from '@oclif/core'

import { daemonRestart } from '../daemon/daemon-restart.js'

/**
 * Restart the centy daemon
 */
export default class Restart extends Command {
  static override description = 'Restart the centy daemon'

  static override examples = [
    '<%= config.bin %> restart',
    '<%= config.bin %> restart --delay 5',
  ]

  static override flags = {
    delay: Flags.integer({
      char: 'd',
      description: 'Delay in seconds before restart',
      default: 0,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Restart)

    try {
      const response = await daemonRestart({
        delaySeconds: flags.delay,
      })

      if (!response.success) {
        this.error(response.message)
      }

      this.log(response.message || 'Daemon restart initiated')
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      if (msg.includes('UNAVAILABLE') || msg.includes('ECONNREFUSED')) {
        this.error(
          'Centy daemon is not running. Please start the daemon first.'
        )
      }
      this.error(msg)
    }
  }
}
