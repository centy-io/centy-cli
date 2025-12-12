// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { installDaemon } from '../../lib/install-daemon/index.js'

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class InstallDaemon extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Download and install the centy daemon binary'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> install daemon',
    '<%= config.bin %> install daemon --version 0.1.0',
    '<%= config.bin %> install daemon --force',
    '<%= config.bin %> install daemon --skip-checksum',
  ]

  // eslint-disable-next-line no-restricted-syntax
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
      // eslint-disable-next-line no-restricted-syntax
      this.error(result.error ?? 'Failed to install daemon')
    }

    this.log(
      `Daemon ${result.version} installed successfully to ${result.installPath}`
    )
  }
}
