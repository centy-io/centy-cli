import { Args, Command, Flags } from '@oclif/core'
import { daemonDeleteOrganization } from '../../daemon/daemon-delete-organization.js'

/**
 * Remove an organization from tracking
 */

export default class UntrackOrg extends Command {
  static override aliases = ['untrack:organization']

  static override args = {
    slug: Args.string({
      description: 'Organization slug',
      required: true,
    }),
  }

  static override description = 'Remove an organization from tracking'

  static override examples = [
    '<%= config.bin %> untrack org my-org',
    '<%= config.bin %> untrack org my-org --force',
    '<%= config.bin %> untrack organization my-org',
  ]

  static override flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UntrackOrg)

    if (!flags.force) {
      const readline = await import('node:readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      const answer = await new Promise<string>(resolve => {
        rl.question(
          `Are you sure you want to untrack organization "${args.slug}"? (y/N) `,
          resolve
        )
      })
      rl.close()
      if (answer.toLowerCase() !== 'y') {
        this.log('Cancelled.')
        return
      }
    }

    const response = await daemonDeleteOrganization({
      slug: args.slug,
      cascade: false,
    })

    if (!response.success) {
      if (response.error.toLowerCase().includes('projects')) {
        const readline = await import('node:readline')
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        })
        const answer = await new Promise<string>(resolve => {
          rl.question(`${response.error} Untrack them as well? (y/N) `, resolve)
        })
        rl.close()

        if (answer.toLowerCase() !== 'y') {
          this.error(response.error)
        }

        const cascadeResponse = await daemonDeleteOrganization({
          slug: args.slug,
          cascade: true,
        })

        if (!cascadeResponse.success) {
          this.error(cascadeResponse.error)
        }

        this.log(`Untracked organization: ${args.slug}`)
        return
      }

      this.error(response.error)
    }

    this.log(`Untracked organization: ${args.slug}`)
  }
}
