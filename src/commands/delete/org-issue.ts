// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonDeleteOrgIssue } from '../../daemon/daemon-delete-org-issue.js'
import { daemonGetOrgIssueByDisplayNumber } from '../../daemon/daemon-get-org-issue-by-display-number.js'

/**
 * Delete an organization-level issue
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class DeleteOrgIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Delete an organization-level issue'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> delete org-issue --org my-org 1',
    '<%= config.bin %> delete org-issue --org my-org #1',
    '<%= config.bin %> delete org-issue -o centy-io abc123',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    identifier: Args.string({
      description: 'Issue ID or display number (#N or just N)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    org: Flags.string({
      char: 'o',
      description: 'Organization slug',
      required: true,
    }),
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DeleteOrgIssue)

    // Resolve issue ID from display number if needed
    let issueId: string
    const identifier = args.identifier
    const displayNumberMatch = identifier.match(/^#?(\d+)$/)

    if (displayNumberMatch) {
      const displayNumber = Number.parseInt(displayNumberMatch[1], 10)
      const issue = await daemonGetOrgIssueByDisplayNumber({
        orgSlug: flags.org,
        displayNumber,
      })
      issueId = issue.id
    } else {
      issueId = identifier
    }

    const response = await daemonDeleteOrgIssue({
      orgSlug: flags.org,
      issueId,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify({ success: true, issueId }, null, 2))
      return
    }

    this.log(`Deleted organization issue ${identifier} from "${flags.org}"`)
  }
}
