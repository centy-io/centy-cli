import { Args, Command, Flags } from '@oclif/core'

import { daemonGetOrgIssueByDisplayNumber } from '../../daemon/daemon-get-org-issue-by-display-number.js'
import { daemonUpdateOrgIssue } from '../../daemon/daemon-update-org-issue.js'

/**
 * Update an organization-level issue
 */
export default class UpdateOrgIssue extends Command {
  static override description = 'Update an organization-level issue'

  static override examples = [
    '<%= config.bin %> update org-issue --org my-org 1 --status closed',
    '<%= config.bin %> update org-issue --org my-org #1 --priority high',
    '<%= config.bin %> update org-issue -o centy-io abc123 --title "New title"',
    '<%= config.bin %> update org-issue --org my-org 1 --add-project /path/to/project',
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
    title: Flags.string({
      char: 't',
      description: 'New issue title',
    }),
    description: Flags.string({
      char: 'd',
      description: 'New issue description',
    }),
    status: Flags.string({
      char: 's',
      description: 'New status',
    }),
    priority: Flags.string({
      char: 'p',
      description: 'New priority level (low/medium/high)',
      options: ['low', 'medium', 'high'],
    }),
    'add-project': Flags.string({
      description: 'Add a project path to referenced projects',
      multiple: true,
    }),
    'remove-project': Flags.string({
      description: 'Remove a project path from referenced projects',
      multiple: true,
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UpdateOrgIssue)

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

    const priorityMap: Record<string, number> = {
      high: 1,
      medium: 2,
      low: 3,
    }

    // Build referenced projects update
    let referencedProjects: string[] | undefined

    if (flags['add-project'] || flags['remove-project']) {
      // Get current issue to modify projects
      const currentIssue = await daemonGetOrgIssueByDisplayNumber({
        orgSlug: flags.org,
        displayNumber: Number.parseInt(identifier.replace('#', ''), 10),
      }).catch(() => null)

      const currentProjects =
        currentIssue &&
        currentIssue.metadata &&
        currentIssue.metadata.referencedProjects
          ? currentIssue.metadata.referencedProjects
          : []
      const projectSet = new Set(currentProjects)

      for (const project of flags['add-project'] ?? []) {
        projectSet.add(project)
      }

      for (const project of flags['remove-project'] ?? []) {
        projectSet.delete(project)
      }

      referencedProjects = [...projectSet]
    }

    const response = await daemonUpdateOrgIssue({
      orgSlug: flags.org,
      issueId,
      title: flags.title,
      description: flags.description,
      status: flags.status,
      priority: flags.priority ? priorityMap[flags.priority] : undefined,
      referencedProjects,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.issue, null, 2))
      return
    }

    this.log(`Updated organization issue #${response.issue.displayNumber}`)
  }
}
