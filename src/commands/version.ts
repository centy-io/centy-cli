import { Command, Flags } from '@oclif/core'
import { daemonGetDaemonInfo } from '../daemon/daemon-get-daemon-info.js'
import { getVersion } from '../get-version.js'

/**
 * Show CLI and daemon version information
 */

export default class Version extends Command {

  static override description = 'Show CLI and daemon version information'


  static override examples = [
    '<%= config.bin %> version',
    '<%= config.bin %> version --json',
  ]


  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Version)

    const cliVersion = getVersion()

    let daemonVersion: string | null = null
    let daemonStatus: string

    try {
      const daemonInfo = await daemonGetDaemonInfo({})
      daemonVersion = daemonInfo.version
      daemonStatus =
        daemonVersion === cliVersion ? 'Up to date' : 'Version mismatch'
    } catch {
      daemonStatus = 'Not running'
    }

    if (flags.json) {
      this.log(
        JSON.stringify(
          {
            cli: cliVersion,
            daemon: daemonVersion,
            status: daemonStatus,
          },
          null,
          2
        )
      )
      return
    }

    this.log(`CLI: ${cliVersion}`)
    this.log(
      `Daemon: ${daemonVersion !== null ? daemonVersion : 'not running'}`
    )
    this.log(`Status: ${daemonStatus}`)
  }
}
