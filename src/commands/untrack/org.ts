// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonDeleteOrganization } from '../../daemon/daemon-delete-organization.js'
import { promptQuestion } from '../../utils/create-prompt-interface.js'

/**
 * Remove an organization from tracking
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class UntrackOrg extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['untrack:organization']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    slug: Args.string({
      description: 'Organization slug',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Remove an organization from tracking'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> untrack org my-org',
    '<%= config.bin %> untrack org my-org --force',
    '<%= config.bin %> untrack organization my-org',
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
    const { args, flags } = await this.parse(UntrackOrg)

    if (!flags.force) {
      const answer = await promptQuestion(
        `Are you sure you want to untrack organization "${args.slug}"? (y/N) `
      )
      if (answer === null || answer.toLowerCase() !== 'y') {
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
        const answer = await promptQuestion(
          `${response.error} Untrack them as well? (y/N) `
        )

        if (answer === null || answer.toLowerCase() !== 'y') {
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
