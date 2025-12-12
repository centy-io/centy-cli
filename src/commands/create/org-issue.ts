// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonCreateOrgIssue } from '../../daemon/daemon-create-org-issue.js'

/**
 * Create a new organization-level issue
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class CreateOrgIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Create a new organization-level issue'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> create org-issue --org my-org --title "Cross-project refactor"',
    '<%= config.bin %> create org-issue -o centy-io -t "API design" -d "Standardize API patterns"',
    '<%= config.bin %> create org-issue --org my-org --title "Bug" --priority high --projects /path/to/project1,/path/to/project2',
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
    title: Flags.string({
      char: 't',
      description: 'Issue title',
      required: true,
    }),
    description: Flags.string({
      char: 'd',
      description: 'Issue description',
    }),
    priority: Flags.string({
      char: 'p',
      description: 'Priority level (low/medium/high)',
      options: ['low', 'medium', 'high'],
    }),
    status: Flags.string({
      char: 's',
      description: 'Initial status',
      default: 'open',
    }),
    projects: Flags.string({
      description:
        'Comma-separated list of project paths this issue references',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CreateOrgIssue)
    // eslint-disable-next-line no-restricted-syntax
    const orgSlug = flags.org ?? args.org

    if (!orgSlug) {
      this.error(
        'Organization slug is required (use --org or provide as argument)'
      )
    }

    const priorityMap: Record<string, number> = {
      high: 1,
      medium: 2,
      low: 3,
    }

    const referencedProjects = flags.projects
      ? flags.projects.split(',').map(p => p.trim())
      : []

    const response = await daemonCreateOrgIssue({
      orgSlug,
      title: flags.title,
      // eslint-disable-next-line no-restricted-syntax
      description: flags.description ?? '',
      priority: flags.priority ? priorityMap[flags.priority] : 0,
      // eslint-disable-next-line no-restricted-syntax
      status: flags.status ?? 'open',
      customFields: {},
      referencedProjects,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(
        JSON.stringify(
          {
            id: response.id,
            displayNumber: response.displayNumber,
            issueNumber: response.issueNumber,
          },
          null,
          2
        )
      )
      return
    }

    this.log(
      `Created organization issue #${response.displayNumber}: ${flags.title}`
    )
    this.log(`  ID: ${response.id}`)
    this.log(`  Organization: ${orgSlug}`)
  }
}
