import { Command, Flags } from '@oclif/core'
import { installTui } from '../../lib/install-binary/index.js'

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class InstallTui extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Download and install the centy TUI binary'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> install tui',
    '<%= config.bin %> install tui --version 0.1.0',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    version: Flags.string({
      char: 'v',
      description: 'Specific version to install (default: latest)',
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(InstallTui)

    try {
      const result = await installTui({
        version: flags.version,
        onProgress: message => this.log(message),
      })

      this.log(`centy-tui v${result.version} installed successfully`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.error(`Failed to install centy-tui: ${message}`)
    }
  }
}
