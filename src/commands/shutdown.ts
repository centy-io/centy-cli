// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonControlService } from '../daemon/daemon-control-service.js'

/**
 * Shutdown the centy daemon gracefully
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Shutdown extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Shutdown the centy daemon gracefully'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> shutdown',
    '<%= config.bin %> shutdown --delay 5',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    delay: Flags.integer({
      char: 'd',
      description: 'Delay in seconds before shutdown',
      default: 0,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Shutdown)

    const result = await daemonControlService.shutdown({
      delaySeconds: flags.delay,
    })

    if (!result.success) {
      // eslint-disable-next-line no-restricted-syntax
      this.error(result.error ?? 'Shutdown failed')
    }

    this.log(result.data ? result.data.message : 'Daemon shutdown initiated')
  }
}
