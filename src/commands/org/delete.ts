// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonDeleteOrganization } from '../../daemon/daemon-delete-organization.js'

/**
 * Delete an organization
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class OrgDelete extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['delete:org', 'delete:organization']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    slug: Args.string({
      description: 'Organization slug',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Delete an organization (must have no projects assigned)'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> org delete my-org --force',
    '<%= config.bin %> delete org my-org --force',
    '<%= config.bin %> delete organization old-org --force',
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
    const { args, flags } = await this.parse(OrgDelete)

    if (!flags.force) {
      this.log(`Warning: This will delete organization "${args.slug}"`)
      this.log('Use --force to skip this warning')
      // In a real implementation, you'd use a prompt here
      // For now, we just require --force
      this.error('Use --force to confirm deletion')
    }

    const response = await daemonDeleteOrganization({
      slug: args.slug,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Deleted organization: ${args.slug}`)
  }
}
