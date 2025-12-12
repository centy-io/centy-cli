// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonSetProjectOrganization } from '../../daemon/daemon-set-project-organization.js'

/**
 * Set or remove project organization assignment
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ProjectOrg extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['project:organization']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    slug: Args.string({
      description: 'Organization slug (omit to remove from organization)',
      required: false,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Assign or remove a project from an organization'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> project org centy-io',
    '<%= config.bin %> project org my-org --path /path/to/project',
    '<%= config.bin %> project org --remove',
    '<%= config.bin %> project organization centy-io',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    path: Flags.string({
      char: 'p',
      description: 'Path to the project (defaults to current directory)',
    }),
    remove: Flags.boolean({
      char: 'r',
      description: 'Remove project from its organization',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ProjectOrg)
    // eslint-disable-next-line no-restricted-syntax
    const projectPath = flags.path ?? process.env['CENTY_CWD'] ?? process.cwd()

    if (!args.slug && !flags.remove) {
      this.error('Provide an organization slug or use --remove to unassign')
    }

    // eslint-disable-next-line no-restricted-syntax
    const organizationSlug = flags.remove ? '' : (args.slug ?? '')

    const response = await daemonSetProjectOrganization({
      projectPath,
      organizationSlug,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.project, null, 2))
      return
    }

    if (flags.remove || !args.slug) {
      this.log(`Removed "${response.project.name}" from organization`)
    } else {
      this.log(
        `Assigned "${response.project.name}" to organization: ${args.slug}`
      )
    }
  }
}
