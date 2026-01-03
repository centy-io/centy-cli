// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonListOrganizations } from '../../daemon/daemon-list-organizations.js'

/**
 * List all organizations
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ListOrgs extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['list:organizations', 'org:list']

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all organizations'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> list orgs',
    '<%= config.bin %> list organizations',
    '<%= config.bin %> list orgs --json',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListOrgs)

    const response = await daemonListOrganizations({})

    if (flags.json) {
      this.log(JSON.stringify(response.organizations, null, 2))
      return
    }

    if (response.organizations.length === 0) {
      this.log('No organizations found.')
      this.log('\nCreate one with: centy create org "My Organization"')
      return
    }

    this.log(`Found ${response.totalCount} organization(s):\n`)
    for (const org of response.organizations) {
      this.log(`  ${org.name} (${org.slug})`)
      if (org.description) {
        this.log(`    ${org.description}`)
      }
      this.log(`    Projects: ${org.projectCount}`)
      this.log('')
    }
  }
}
