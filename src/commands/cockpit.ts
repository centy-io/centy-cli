import { Command } from '@oclif/core'
import { launchTuiManager } from '../lib/launch-tui-manager/index.js'

export default class Cockpit extends Command {
  static override description =
    'Launch the TUI Manager (cockpit) for multi-pane terminal'

  static override examples = ['<%= config.bin %> cockpit']

  public async run(): Promise<void> {
    const result = await launchTuiManager()

    if (result.success) {
      return
    }

    const errorMessage =
      result.error !== null && result.error !== undefined
        ? result.error
        : 'Failed to launch TUI Manager'
    this.error(errorMessage)
  }
}
