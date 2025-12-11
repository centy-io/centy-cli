/* eslint-disable ddd/require-spec-file */
import { Command, Flags } from '@oclif/core'

import { installDaemon } from '../../lib/install-daemon/index.js'

export default class InstallDaemon extends Command {
  static override description = 'Download and install the centy daemon binary'

  static override examples = [
    '<%= config.bin %> install daemon',
    '<%= config.bin %> install daemon --version 0.1.0',
    '<%= config.bin %> install daemon --force',
    '<%= config.bin %> install daemon --skip-checksum',
  ]

  static override flags = {
    version: Flags.string({
      char: 'v',
      description: 'Specific version to install (default: latest)',
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Force reinstall even if already installed',
      default: false,
    }),
    'skip-checksum': Flags.boolean({
      description: 'Skip SHA256 checksum verification',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(InstallDaemon)

    const result = await installDaemon({
      version: flags.version,
      force: flags.force,
      skipChecksum: flags['skip-checksum'],
      log: msg => this.log(msg),
      warn: msg => this.warn(msg),
    })

    if (!result.success) {
      this.error(result.error ?? 'Failed to install daemon')
    }

    this.log(
      `Daemon ${result.version} installed successfully to ${result.installPath}`
    )
  }
}
