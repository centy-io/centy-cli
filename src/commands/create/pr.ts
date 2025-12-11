import { Command, Flags } from '@oclif/core'

import { projectFlag } from '../../flags/project-flag.js'
import { createPr } from '../../lib/create-pr/index.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Create a new pull request in the .centy/prs folder
 */
export default class CreatePrCommand extends Command {
  static override description = 'Create a new pull request in the .centy folder'

  static override examples = [
    '<%= config.bin %> create pr',
    '<%= config.bin %> create pr --title "Add feature" --source feature-branch',
    '<%= config.bin %> create pr -t "Bug fix" -s bugfix/123 --target main',
    '<%= config.bin %> create pr -t "Feature" --issues 1,2 --reviewers alice,bob',
    '<%= config.bin %> create pr -t "Feature" --project centy-daemon',
  ]

  static override flags = {
    title: Flags.string({
      char: 't',
      description: 'PR title',
    }),
    description: Flags.string({
      char: 'd',
      description: 'PR description',
    }),
    source: Flags.string({
      char: 's',
      description: 'Source branch name (auto-detected if not provided)',
    }),
    target: Flags.string({
      description: 'Target branch name (defaults to main)',
    }),
    issues: Flags.string({
      char: 'i',
      description: 'Linked issue IDs (comma-separated)',
    }),
    reviewers: Flags.string({
      char: 'r',
      description: 'Reviewers (comma-separated)',
    }),
    priority: Flags.string({
      char: 'p',
      description: 'Priority level (low/medium/high)',
      options: ['low', 'medium', 'high'],
    }),
    status: Flags.string({
      description: 'Initial status (draft/open)',
      options: ['draft', 'open'],
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(CreatePrCommand)
    const cwd = await resolveProjectPath(flags.project)

    // Parse comma-separated lists
    const linkedIssues = flags.issues
      ? flags.issues.split(',').map(s => s.trim())
      : undefined
    const reviewers = flags.reviewers
      ? flags.reviewers.split(',').map(s => s.trim())
      : undefined

    const result = await createPr({
      cwd,
      title: flags.title,
      description: flags.description,
      sourceBranch: flags.source,
      targetBranch: flags.target,
      linkedIssues,
      reviewers,
      priority: flags.priority as 'low' | 'medium' | 'high' | undefined,
      status: flags.status as 'draft' | 'open' | undefined,
    })

    if (!result.success) {
      this.error(result.error)
    }
  }
}
