// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonSetProjectArchived } from '../../daemon/daemon-set-project-archived.js'

/**
 * Archive or unarchive a project
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ProjectArchive extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    path: Args.string({
      description: 'Path to the project (defaults to current directory)',
      required: false,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Archive or unarchive a project'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> project archive',
    '<%= config.bin %> project archive /path/to/project',
    '<%= config.bin %> project archive --off',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    off: Flags.boolean({
      description: 'Unarchive the project',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectArchive)
    // eslint-disable-next-line no-restricted-syntax
    const projectPath = args.path ?? process.env['CENTY_CWD'] ?? process.cwd()

    const response = await daemonSetProjectArchived({
      projectPath,
      isArchived: !flags.off,
    })

    if (!response.success) {
      this.error(response.error)
    }

    const action = flags.off ? 'Unarchived' : 'Archived'
    this.log(`${action}: "${response.project.name}"`)
  }
}
