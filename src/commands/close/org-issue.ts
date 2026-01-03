// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetOrgIssueByDisplayNumber } from '../../daemon/daemon-get-org-issue-by-display-number.js'
import { daemonUpdateOrgIssue } from '../../daemon/daemon-update-org-issue.js'

/**
 * Close an organization-level issue by setting its status to closed
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class CloseOrgIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Close an organization-level issue'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> close org-issue --org my-org 1',
    '<%= config.bin %> close org-issue --org my-org #1',
    '<%= config.bin %> close org-issue -o centy-io abc123',
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
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CloseOrgIssue)

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

    const response = await daemonUpdateOrgIssue({
      orgSlug: flags.org,
      issueId,
      status: 'closed',
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.issue, null, 2))
      return
    }

    this.log(`Closed organization issue #${response.issue.displayNumber}`)
  }
}
