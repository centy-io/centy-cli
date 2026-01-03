// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonSetProjectTitle } from '../../daemon/daemon-set-project-title.js'
import { daemonSetProjectUserTitle } from '../../daemon/daemon-set-project-user-title.js'

/**
 * Set a custom title for a project
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ProjectTitle extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    title: Args.string({
      description: 'Custom title for the project (omit to clear)',
      required: false,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Set a custom title for a project'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> project title "My Awesome Project"',
    '<%= config.bin %> project title "Work Project" --shared',
    '<%= config.bin %> project title --clear',
    '<%= config.bin %> project title --clear --shared',
    '<%= config.bin %> project title "Custom Name" --path /path/to/project',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    path: Flags.string({
      char: 'p',
      description: 'Path to the project (defaults to current directory)',
    }),
    shared: Flags.boolean({
      char: 's',
      description:
        'Set project-scope title (visible to all, stored in .centy/project.json)',
      default: false,
    }),
    clear: Flags.boolean({
      char: 'c',
      description: 'Clear the custom title',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectTitle)
    // eslint-disable-next-line no-restricted-syntax
    const projectPath = flags.path ?? process.env['CENTY_CWD'] ?? process.cwd()

    // eslint-disable-next-line no-restricted-syntax
    const title = flags.clear ? '' : (args.title ?? '')

    if (!title && !flags.clear) {
      this.error('Provide a title or use --clear to remove')
    }

    const response = flags.shared
      ? await daemonSetProjectTitle({ projectPath, title })
      : await daemonSetProjectUserTitle({ projectPath, title })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.project, null, 2))
      return
    }

    const scope = flags.shared ? 'project-scope' : 'user-scope'
    if (flags.clear || !args.title) {
      this.log(`Cleared ${scope} title for "${response.project.name}"`)
    } else {
      this.log(`Set ${scope} title: "${args.title}"`)
    }
  }
}
