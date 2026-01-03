// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonSetProjectFavorite } from '../../daemon/daemon-set-project-favorite.js'

/**
 * Mark a project as favorite or unfavorite
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ProjectFavorite extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    path: Args.string({
      description: 'Path to the project (defaults to current directory)',
      required: false,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Mark a project as favorite or unfavorite'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> project favorite',
    '<%= config.bin %> project favorite /path/to/project',
    '<%= config.bin %> project favorite --off',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    off: Flags.boolean({
      description: 'Remove from favorites',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectFavorite)
    // eslint-disable-next-line no-restricted-syntax
    const projectPath = args.path ?? process.env['CENTY_CWD'] ?? process.cwd()

    const response = await daemonSetProjectFavorite({
      projectPath,
      isFavorite: !flags.off,
    })

    if (!response.success) {
      this.error(response.error)
    }

    const action = flags.off ? 'Removed from favorites' : 'Added to favorites'
    this.log(`${action}: "${response.project.name}"`)
  }
}
