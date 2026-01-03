// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonCloseTempWorkspace } from '../../daemon/daemon-close-temp-workspace.js'

/**
 * Close and remove a temporary workspace
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class WorkspaceClose extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Close and remove a temporary workspace'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> workspace close /tmp/centy-workspace-abc123',
    '<%= config.bin %> workspace close /tmp/centy-workspace-abc123 --force',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    path: Args.string({
      description: 'Path to the workspace to close',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Force removal even if VS Code may be open',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WorkspaceClose)

    const response = await daemonCloseTempWorkspace({
      workspacePath: args.path,
      force: flags.force,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Workspace closed: ${args.path}`)
    if (response.worktreeRemoved) {
      this.log('Git worktree removed')
    }
    if (response.registryRemoved) {
      this.log('Registry entry removed')
    }
  }
}
