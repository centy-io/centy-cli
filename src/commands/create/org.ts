import { Args, Command, Flags } from '@oclif/core'

import { daemonCreateOrganization } from '../../daemon/daemon-create-organization.js'

/**
 * Create a new organization
 */
export default class CreateOrg extends Command {
  static override aliases = ['create:organization']

  static override args = {
    name: Args.string({
      description: 'Organization display name',
      required: true,
    }),
  }

  static override description = 'Create a new organization to group projects'

  static override examples = [
    '<%= config.bin %> create org "My Company"',
    '<%= config.bin %> create org "Centy.io" --slug centy-io',
    '<%= config.bin %> create org "My Org" --description "Official projects"',
    '<%= config.bin %> create organization "Work Projects"',
  ]

  static override flags = {
    slug: Flags.string({
      char: 's',
      description: 'Custom slug (auto-generated from name if not provided)',
    }),
    description: Flags.string({
      char: 'd',
      description: 'Organization description',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CreateOrg)

    const response = await daemonCreateOrganization({
      name: args.name,
      slug: flags.slug,
      description: flags.description,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.organization, null, 2))
      return
    }

    const org = response.organization!
    this.log(`Created organization: ${org.name}`)
    this.log(`  Slug: ${org.slug}`)
    if (org.description) {
      this.log(`  Description: ${org.description}`)
    }
  }
}
