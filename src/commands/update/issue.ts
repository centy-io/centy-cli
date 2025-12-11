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
export default class UpdateIssue extends Command {
  static override args = {
    id: Args.string({
      description: 'Issue ID (UUID) or display number',
      required: true,
    }),
  }

  static override description = 'Update an existing issue'

  static override examples = [
    '<%= config.bin %> update issue 1 --status closed',
    '<%= config.bin %> update issue 1 --title "New title" --priority high',
    '<%= config.bin %> update issue abc123 --status in-progress',
    '<%= config.bin %> update issue 1 --status closed --project centy-daemon',
  ]

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
      !flags.priority
    ) {
      this.error('At least one field must be specified to update.')
    }

    const response = await daemonUpdateIssue({
      projectPath: cwd,
      issueId: args.id,
      title: flags.title,
      description: flags.description,
      status: flags.status,
      priority: this.convertPriority(flags.priority),
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Updated issue #${response.issue.displayNumber}`)
  }
}
