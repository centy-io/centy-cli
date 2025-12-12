// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonControlService } from '../daemon/daemon-control-service.js'

/**
 * Restart the centy daemon
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Restart extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Restart the centy daemon'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> restart',
    '<%= config.bin %> restart --delay 5',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    delay: Flags.integer({
      char: 'd',
      description: 'Delay in seconds before restart',
      default: 0,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Restart)

    const result = await daemonControlService.restart({
      delaySeconds: flags.delay,
    })

    if (!result.success) {
      // eslint-disable-next-line no-restricted-syntax
      this.error(result.error ?? 'Restart failed')
    }

    this.log(result.data ? result.data.message : 'Daemon restart initiated')
  }
}
