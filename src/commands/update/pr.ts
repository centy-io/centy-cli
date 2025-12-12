/* eslint-disable max-lines */

// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetPrByDisplayNumber } from '../../daemon/daemon-get-pr-by-display-number.js'
import { daemonUpdatePr } from '../../daemon/daemon-update-pr.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

const PRIORITY_MAP: Record<string, number> = { high: 1, medium: 2, low: 3 }

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class UpdatePr extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'PR ID (UUID) or display number',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Update an existing pull request'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> update pr 1 --status open',
    '<%= config.bin %> update pr 1 --title "New title"',
    '<%= config.bin %> update pr 1 --status open --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    title: Flags.string({ char: 't', description: 'New title' }),
    description: Flags.string({ char: 'd', description: 'New description' }),
    status: Flags.string({
      char: 's',
      description: 'New status (draft, open, merged, closed)',
      options: ['draft', 'open', 'merged', 'closed'],
    }),
    source: Flags.string({ description: 'New source branch' }),
    target: Flags.string({ description: 'New target branch' }),
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
      description: 'New priority (low/medium/high)',
      options: ['low', 'medium', 'high'],
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UpdatePr)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const hasUpdates = Boolean(
      flags.title ||
      flags.description ||
      flags.status ||
      flags.source ||
      flags.target ||
      flags.issues ||
      flags.reviewers ||
      flags.priority
    )
    if (!hasUpdates) {
      this.error('At least one field must be specified to update.')
    }

    const priority = flags.priority ? PRIORITY_MAP[flags.priority] : undefined
    const linkedIssues = flags.issues
      ? flags.issues.split(',').map(s => s.trim())
      : undefined
    const reviewers = flags.reviewers
      ? flags.reviewers.split(',').map(s => s.trim())
      : undefined

    const displayNumber = Number.parseInt(args.id, 10)
    const isDisplayNumber = !Number.isNaN(displayNumber) && displayNumber > 0
    let prId = args.id

    if (isDisplayNumber) {
      const pr = await daemonGetPrByDisplayNumber({
        projectPath: cwd,
        displayNumber,
      })
      prId = pr.id
    }

    const response = await daemonUpdatePr({
      projectPath: cwd,
      prId,
      title: flags.title,
      description: flags.description,
      status: flags.status,
      sourceBranch: flags.source,
      targetBranch: flags.target,
      linkedIssues,
      reviewers,
      priority,
      customFields: {},
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Updated PR #${response.pr.displayNumber}`)
  }
}
