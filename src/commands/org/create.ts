import { Args, Command, Flags } from '@oclif/core'
import { daemonCreateOrganization } from '../../daemon/daemon-create-organization.js'

/**
 * Create a new organization
 */

export default class OrgCreate extends Command {
  static override args = {
    name: Args.string({
      description: 'Organization display name',
      required: true,
    }),
  }

  static override description = 'Create a new organization to group projects'

  static override examples = [
    '<%= config.bin %> org create "My Company"',
    '<%= config.bin %> org create "Centy.io" --slug centy-io',
    '<%= config.bin %> org create "My Org" --description "Official projects"',
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
    const { args, flags } = await this.parse(OrgCreate)

    const response = await daemonCreateOrganization({
      name: args.name,
      slug: flags.slug !== undefined ? flags.slug : '',
      description: flags.description !== undefined ? flags.description : '',
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
