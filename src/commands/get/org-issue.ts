import { Args, Command, Flags } from '@oclif/core'

import { daemonGetOrgIssue } from '../../daemon/daemon-get-org-issue.js'
import { daemonGetOrgIssueByDisplayNumber } from '../../daemon/daemon-get-org-issue-by-display-number.js'

/**
 * Get an organization-level issue by ID or display number
 */
export default class GetOrgIssue extends Command {
  static override description = 'Get an organization-level issue'

  static override examples = [
    '<%= config.bin %> get org-issue --org my-org 1',
    '<%= config.bin %> get org-issue --org my-org #1',
    '<%= config.bin %> get org-issue -o centy-io abc123',
    '<%= config.bin %> get org-issue --org my-org 1 --json',
  ]

  static override args = {
    identifier: Args.string({
      description: 'Issue ID or display number (#N or just N)',
      required: true,
    }),
  }

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
    const { args, flags } = await this.parse(GetOrgIssue)

    let issue
    const identifier = args.identifier

    // Check if it's a display number (#N or just a number)
    const displayNumberMatch = identifier.match(/^#?(\d+)$/)

    if (displayNumberMatch) {
      const displayNumber = Number.parseInt(displayNumberMatch[1], 10)
      issue = await daemonGetOrgIssueByDisplayNumber({
        orgSlug: flags.org,
        displayNumber,
      })
    } else {
      // Treat as UUID
      issue = await daemonGetOrgIssue({
        orgSlug: flags.org,
        issueId: identifier,
      })
    }

    if (flags.json) {
      this.log(JSON.stringify(issue, null, 2))
      return
    }

    const meta = issue.metadata
    this.log(`Organization Issue #${issue.displayNumber}`)
    this.log(`  ID: ${issue.id}`)
    this.log(`  Title: ${issue.title}`)
    if (meta) {
      this.log(`  Status: ${meta.status}`)
      const priority = meta.priorityLabel || `P${meta.priority}`
      this.log(`  Priority: ${priority}`)
      this.log(`  Created: ${meta.createdAt}`)
      this.log(`  Updated: ${meta.updatedAt}`)
      if (meta.referencedProjects && meta.referencedProjects.length > 0) {
        this.log(`  Referenced Projects:`)
        for (const project of meta.referencedProjects) {
          this.log(`    - ${project}`)
        }
      }
    }
    if (issue.description) {
      this.log(`\nDescription:\n${issue.description}`)
    }
  }
}
