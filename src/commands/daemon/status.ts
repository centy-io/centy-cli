// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { checkDaemonConnection } from '../../daemon/check-daemon-connection.js'
import { daemonGetDaemonInfo } from '../../daemon/daemon-get-daemon-info.js'

/**
 * Check daemon status
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class DaemonStatus extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Check whether the centy daemon is running'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> daemon status',
    '<%= config.bin %> daemon status --json',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(DaemonStatus)

    const connectionStatus = await checkDaemonConnection()

    if (!connectionStatus.connected) {
      if (flags.json) {
        this.log(
          JSON.stringify(
            { status: 'stopped', error: connectionStatus.error },
            null,
            2
          )
        )
        return
      }

      this.log('Daemon status: stopped')
      if (connectionStatus.error) {
        this.log(`  Reason: ${connectionStatus.error}`)
      }
      return
    }

    try {
      const info = await daemonGetDaemonInfo({})
      // eslint-disable-next-line no-restricted-syntax
      const envAddr = process.env['CENTY_DAEMON_ADDR']
      const address =
        envAddr !== undefined && envAddr !== '' ? envAddr : '127.0.0.1:50051'

      if (flags.json) {
        this.log(
          JSON.stringify(
            {
              status: 'running',
              version: info.version,
              address,
              ...(info.binaryPath ? { binaryPath: info.binaryPath } : {}),
            },
            null,
            2
          )
        )
        return
      }

      this.log('Daemon status: running')
      this.log(`  Version: ${info.version}`)
      this.log(`  Address: ${address}`)
      if (info.binaryPath) {
        this.log(`  Binary: ${info.binaryPath}`)
      }
    } catch {
      if (flags.json) {
        this.log(JSON.stringify({ status: 'running' }, null, 2))
        return
      }

      this.log('Daemon status: running')
    }
  }
}
