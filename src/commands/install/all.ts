import { Command, Flags } from '@oclif/core'
import { installAll } from '../../lib/install-binary/index.js'

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class InstallAll extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Download and install all centy binaries (daemon and tui)'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = ['<%= config.bin %> install all']

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    version: Flags.string({
      char: 'v',
      description: 'Specific version to install (default: latest)',
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(InstallAll)

    try {
      await installAll({
        version: flags.version,
        onProgress: message => this.log(message),
      })

      this.log('All centy binaries installed successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.error(`Failed to install centy binaries: ${message}`)
    }
  }
}
