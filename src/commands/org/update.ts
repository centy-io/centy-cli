import { Args, Command, Flags } from '@oclif/core'
import { daemonUpdateOrganization } from '../../daemon/daemon-update-organization.js'

/**
 * Update an organization
 */

export default class OrgUpdate extends Command {
  static override aliases = [
    'update:org',
    'update:organization',
    'edit:org',
    'edit:organization',
  ]

  static override args = {
    slug: Args.string({
      description: 'Organization slug',
      required: true,
    }),
  }

  static override description = 'Update an organization'

  static override examples = [
    '<%= config.bin %> org update my-org --name "New Name"',
    '<%= config.bin %> org update my-org --description "Updated description"',
    '<%= config.bin %> org update my-org --new-slug new-slug',
    '<%= config.bin %> update org centy-io --name "Centy.io"',
  ]

  static override flags = {
    name: Flags.string({
      char: 'n',
      description: 'New organization name',
    }),
    description: Flags.string({
      char: 'd',
      description: 'New organization description',
    }),
    'new-slug': Flags.string({
      description: 'Rename the organization slug',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(OrgUpdate)

    if (!flags.name && !flags.description && !flags['new-slug']) {
      this.error(
        'At least one of --name, --description, or --new-slug is required'
      )
    }

    const response = await daemonUpdateOrganization({
      slug: args.slug,
      name: flags.name !== undefined ? flags.name : '',
      description: flags.description !== undefined ? flags.description : '',
      newSlug: flags['new-slug'] !== undefined ? flags['new-slug'] : '',
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.organization, null, 2))
      return
    }

    const org = response.organization!
    this.log(`Updated organization: ${org.name}`)
    this.log(`  Slug: ${org.slug}`)
    if (org.description) {
      this.log(`  Description: ${org.description}`)
    }
  }
}
