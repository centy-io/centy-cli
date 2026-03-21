// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonUntrackProject } from '../../daemon/daemon-untrack-project.js'
import { promptQuestion } from '../../utils/create-prompt-interface.js'

/**
 * Remove a project from tracking
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class UntrackProject extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    path: Args.string({
      description: 'Path to the project (defaults to current directory)',
      required: false,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Remove a project from tracking'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> untrack project',
    '<%= config.bin %> untrack project /path/to/project',
    '<%= config.bin %> untrack project --force',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UntrackProject)
    // eslint-disable-next-line no-restricted-syntax
    const projectPath = args.path ?? process.env['CENTY_CWD'] ?? process.cwd()

    if (!flags.force) {
      const answer = await promptQuestion(
        `Are you sure you want to untrack project at "${projectPath}"? (y/N) `
      )
      if (answer === null || answer.toLowerCase() !== 'y') {
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
