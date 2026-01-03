import { Command } from '@oclif/core'
import { launchTuiManager } from '../lib/launch-tui-manager/index.js'

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Cockpit extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Launch the TUI Manager (cockpit) for multi-pane terminal'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = ['<%= config.bin %> cockpit']

  public async run(): Promise<void> {
    const result = await launchTuiManager()

    if (!result.success) {
      const errorMessage =
        result.error !== null && result.error !== undefined
          ? result.error
          : 'Failed to launch TUI Manager'
      this.error(errorMessage)
    }
  }
}
