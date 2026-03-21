import { Args, Command, Flags } from '@oclif/core'
import { daemonDeleteOrganization } from '../../daemon/daemon-delete-organization.js'

/**
 * Delete an organization
 */

export default class OrgDelete extends Command {
  static override aliases = ['delete:org', 'delete:organization']

  static override args = {
    slug: Args.string({
      description: 'Organization slug',
      required: true,
    }),
  }

  static override description =
    'Delete an organization (must have no projects assigned)'

  static override examples = [
    '<%= config.bin %> org delete my-org --force',
    '<%= config.bin %> delete org my-org --force',
    '<%= config.bin %> delete organization old-org --force',
  ]

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
      cascade: false,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Deleted organization: ${args.slug}`)
  }
}
