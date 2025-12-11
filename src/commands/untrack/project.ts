import { Args, Command, Flags } from '@oclif/core'

import { daemonUntrackProject } from '../../daemon/daemon-untrack-project.js'

/**
 * Remove a project from tracking
 */
export default class UntrackProject extends Command {
  static override args = {
    path: Args.string({
      description: 'Path to the project (defaults to current directory)',
      required: false,
    }),
  }

  static override description = 'Remove a project from tracking'

  static override examples = [
    '<%= config.bin %> untrack project',
    '<%= config.bin %> untrack project /path/to/project',
    '<%= config.bin %> untrack project --force',
  ]

  static override flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UntrackProject)
    const projectPath = args.path ?? process.env['CENTY_CWD'] ?? process.cwd()

    if (!flags.force) {
      const readline = await import('node:readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      const answer = await new Promise<string>(resolve => {
        rl.question(
          `Are you sure you want to untrack project at "${projectPath}"? (y/N) `,
          resolve
        )
      })
      rl.close()
      if (answer.toLowerCase() !== 'y') {
        this.log('Cancelled.')
        return
      }
    }

    const response = await daemonUntrackProject({
      projectPath,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Untracked project at "${projectPath}"`)
  }
}
