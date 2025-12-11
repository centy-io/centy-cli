/* eslint-disable ddd/require-spec-file */
import { Command, Flags } from '@oclif/core'

import { daemonGetDaemonInfo } from '../daemon/daemon-get-daemon-info.js'

/**
 * Get daemon version and info
 */
export default class Info extends Command {
  static override description = 'Get centy daemon info'

  static override examples = [
    '<%= config.bin %> info',
    '<%= config.bin %> info --json',
  ]

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Info)

    try {
      const response = await daemonGetDaemonInfo({})

      if (flags.json) {
        this.log(JSON.stringify(response, null, 2))
        return
      }

      this.log(`Centy Daemon`)
      this.log(`  Version: ${response.version}`)
      if (response.binaryPath) {
        this.log(`  Binary: ${response.binaryPath}`)
      }
      if (response.availableVersions.length > 0) {
        this.log(
          `  Available versions: ${response.availableVersions.join(', ')}`
        )
      }
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
