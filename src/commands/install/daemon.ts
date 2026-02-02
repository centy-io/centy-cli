import { Command, Flags } from '@oclif/core'
import { installDaemon } from '../../lib/install-binary/index.js'

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class InstallDaemon extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Download and install the centy daemon binary'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> install daemon',
    '<%= config.bin %> install daemon --prerelease',
    '<%= config.bin %> install daemon --version 0.2.0-alpha.9',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    version: Flags.string({
      char: 'v',
      description: 'Specific version to install (default: latest)',
    }),
    prerelease: Flags.boolean({
      char: 'p',
      description: 'Include prerelease versions when fetching latest',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(InstallDaemon)

    try {
      const result = await installDaemon({
        version: flags.version,
        prerelease: flags.prerelease,
        onProgress: message => this.log(message),
      })

      this.log(`centy-daemon v${result.version} installed successfully`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.error(`Failed to install centy-daemon: ${message}`)
    }
  }
}
