import { Command, Flags } from '@oclif/core'

import { daemonShutdown } from '../daemon/daemon-shutdown.js'

/**
 * Shutdown the centy daemon gracefully
 */
export default class Shutdown extends Command {
  static override description = 'Shutdown the centy daemon gracefully'

  static override examples = [
    '<%= config.bin %> shutdown',
    '<%= config.bin %> shutdown --delay 5',
  ]

  static override flags = {
    delay: Flags.integer({
      char: 'd',
      description: 'Delay in seconds before shutdown',
      default: 0,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Shutdown)

    try {
      const response = await daemonShutdown({
        delaySeconds: flags.delay,
      })

      if (!response.success) {
        this.error(response.message)
      }

      this.log(response.message || 'Daemon shutdown initiated')
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      // CANCELLED error means daemon shut down before responding - this is success
      if (msg.includes('CANCELLED')) {
        this.log('Daemon shutdown initiated')
        return
      }
      if (msg.includes('UNAVAILABLE') || msg.includes('ECONNREFUSED')) {
        this.error(
          'Centy daemon is not running. Please start the daemon first.'
        )
      }
      this.error(msg)
    }
  }
}
