// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetOrganization } from '../../daemon/daemon-get-organization.js'

/**
 * Get organization details
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class OrgGet extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['get:org', 'get:organization']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    slug: Args.string({
      description: 'Organization slug',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Get organization details by slug'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> org get centy-io',
    '<%= config.bin %> get org centy-io',
    '<%= config.bin %> get organization my-org --json',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(OrgGet)

    const response = await daemonGetOrganization({
      slug: args.slug,
    })

    if (!response.found) {
      this.error(`Organization not found: ${args.slug}`)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.organization, null, 2))
      return
    }

    const org = response.organization!
    this.log(`Organization: ${org.name}`)
    this.log(`  Slug: ${org.slug}`)
    if (org.description) {
      this.log(`  Description: ${org.description}`)
    }
    this.log(`  Projects: ${org.projectCount}`)
    this.log(`  Created: ${org.createdAt}`)
    this.log(`  Updated: ${org.updatedAt}`)
  }
}
