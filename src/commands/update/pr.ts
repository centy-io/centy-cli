/* eslint-disable ddd/require-spec-file */
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetPrByDisplayNumber } from '../../daemon/daemon-get-pr-by-display-number.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'
import { daemonUpdatePr } from '../../daemon/daemon-update-pr.js'

const PRIORITY_MAP: Record<string, number> = { high: 1, medium: 2, low: 3 }

export default class UpdatePr extends Command {
  static override args = {
    id: Args.string({
      description: 'PR ID (UUID) or display number',
      required: true,
    }),
  }

  static override description = 'Update an existing pull request'

  static override examples = [
    '<%= config.bin %> update pr 1 --status open',
    '<%= config.bin %> update pr 1 --title "New title"',
  ]

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
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UpdatePr)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
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
