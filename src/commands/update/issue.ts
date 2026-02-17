// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonUpdateIssue } from '../../daemon/daemon-update-issue.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Update an existing issue
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class UpdateIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['edit:issue']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'Issue ID (UUID) or display number',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Update an existing issue'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> update issue 1 --status closed',
    '<%= config.bin %> update issue 1 --title "New title" --priority high',
    '<%= config.bin %> update issue abc123 --status in-progress',
    '<%= config.bin %> update issue 1 --status closed --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    title: Flags.string({
      char: 't',
      description: 'New title',
    }),
    description: Flags.string({
      char: 'd',
      description: 'New description',
    }),
    status: Flags.string({
      char: 's',
      description: 'New status (e.g., open, in-progress, closed)',
    }),
    priority: Flags.string({
      char: 'p',
      description: 'New priority (low/medium/high or 1-3)',
    }),
    draft: Flags.boolean({
      description: 'Mark as draft (use --no-draft to unmark)',
      allowNo: true,
    }),
    project: projectFlag,
  }

  private convertPriority(priority: string | undefined): number | undefined {
    if (priority === undefined) return undefined
    switch (priority.toLowerCase()) {
      case 'high':
        return 1
      case 'medium':
        return 2
      case 'low':
        return 3
      // eslint-disable-next-line no-restricted-syntax
      default: {
        const num = Number.parseInt(priority, 10)
        return Number.isNaN(num) ? undefined : num
      }
    }
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UpdateIssue)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (
      !flags.title &&
      !flags.description &&
      !flags.status &&
      !flags.priority &&
      flags.draft === undefined
    ) {
      this.error('At least one field must be specified to update.')
    }

    const convertedPriority = this.convertPriority(flags.priority)
    const response = await daemonUpdateIssue({
      projectPath: cwd,
      issueId: args.id,
      title: flags.title !== undefined ? flags.title : '',
      description: flags.description !== undefined ? flags.description : '',
      status: flags.status !== undefined ? flags.status : '',
      priority: convertedPriority !== undefined ? convertedPriority : 0,
      customFields: {},
      draft: flags.draft,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Updated issue #${response.issue!.displayNumber}`)
  }
}
