import { Command, Flags } from '@oclif/core'

import { findDaemonBinary } from '../../lib/start/find-daemon-binary.js'
import { daemonBinaryExists } from '../../lib/start/daemon-binary-exists.js'
import { launchdService } from '../../lib/autostart/launchd.js'

export default class DaemonAutostart extends Command {
  static override description =
    'Configure daemon to start automatically on boot'

  static override examples = [
    '<%= config.bin %> daemon autostart',
    '<%= config.bin %> daemon autostart --enable',
    '<%= config.bin %> daemon autostart --disable',
  ]

  static override flags = {
    enable: Flags.boolean({
      description: 'Enable autostart on boot',
      exclusive: ['disable'],
    }),
    disable: Flags.boolean({
      description: 'Disable autostart on boot',
      exclusive: ['enable'],
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(DaemonAutostart)

    if (process.platform !== 'darwin') {
      this.error('Autostart is currently only supported on macOS')
    }

    if (flags.enable) {
      await this.enable()
    } else if (flags.disable) {
      await this.disable()
    } else {
      await this.showStatus()
    }
  }

  private async enable(): Promise<void> {
    const daemonPath = findDaemonBinary()

    if (!daemonBinaryExists(daemonPath)) {
      this.error(
        `Daemon binary not found at: ${daemonPath}\n` +
          'Please install the daemon first with: centy install daemon'
      )
    }

    try {
      launchdService.enableAutostart(daemonPath)
      this.log(
        'Autostart enabled. The daemon will start automatically on boot.'
      )
      this.log(`Daemon path: ${daemonPath}`)
    } catch (error) {
      this.error(`Failed to enable autostart: ${(error as Error).message}`)
    }
  }

  private async disable(): Promise<void> {
    try {
      launchdService.disableAutostart()
      this.log('Autostart disabled. The daemon will no longer start on boot.')
    } catch (error) {
      this.error(`Failed to disable autostart: ${(error as Error).message}`)
    }
  }

  private async showStatus(): Promise<void> {
    const status = launchdService.getAutostartStatus()

    if (status.enabled) {
      this.log('Autostart: enabled')
      if (status.daemonPath) {
        this.log(`Daemon path: ${status.daemonPath}`)
      }
    } else {
      this.log('Autostart: disabled')
    }
  }
}
