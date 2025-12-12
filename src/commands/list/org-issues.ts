// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonListOrgIssues } from '../../daemon/daemon-list-org-issues.js'

/**
 * List all organization-level issues
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ListOrgIssues extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List organization-level issues'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> list org-issues --org my-org',
    '<%= config.bin %> list org-issues -o centy-io',
    '<%= config.bin %> list org-issues --org my-org --status open',
    '<%= config.bin %> list org-issues --org my-org --json',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    org: Args.string({
      description: 'Organization slug',
      required: false,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    org: Flags.string({
      char: 'o',
      description: 'Organization slug',
    }),
    status: Flags.string({
      char: 's',
      description: 'Filter by status (e.g., open, in-progress, closed)',
    }),
    priority: Flags.integer({
      char: 'p',
      description: 'Filter by priority level (1 = highest)',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ListOrgIssues)
    // eslint-disable-next-line no-restricted-syntax
    const orgSlug = flags.org ?? args.org

    if (!orgSlug) {
      this.error(
        'Organization slug is required (use --org or provide as argument)'
      )
    }

    const response = await daemonListOrgIssues({
      orgSlug,
      status: flags.status,
      priority: flags.priority,
    })

    if (flags.json) {
      this.log(JSON.stringify(response.issues, null, 2))
      return
    }

    if (response.issues.length === 0) {
      this.log(`No issues found in organization "${orgSlug}".`)
      this.log(
        `\nCreate one with: centy create org-issue --org ${orgSlug} --title "Your issue"`
      )
      return
    }

    this.log(
      `Found ${response.totalCount} issue(s) in organization "${orgSlug}":\n`
    )
    for (const issue of response.issues) {
      const meta = issue.metadata
      const priority =
        meta !== undefined
          ? meta.priorityLabel !== ''
            ? meta.priorityLabel
            : `P${meta.priority}`
          : 'P?'
      const status = meta !== undefined ? meta.status : 'unknown'
      const projects =
        meta && meta.referencedProjects && meta.referencedProjects.length > 0
          ? ` (${meta.referencedProjects.length} projects)`
          : ''
      this.log(
        `#${issue.displayNumber} [${priority}] [${status}] ${issue.title}${projects}`
      )
    }
  }
}
