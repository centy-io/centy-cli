// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonAssignIssue } from '../../daemon/daemon-assign-issue.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Assign users to an issue
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class AssignIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    issueId: Args.string({
      description: 'Issue ID (UUID) or display number',
      required: true,
    }),
    userIds: Args.string({
      description: 'User IDs to assign (space-separated)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Assign users to an issue'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> assign issue 1 john-doe',
    '<%= config.bin %> assign issue abc123-uuid alice bob',
    '<%= config.bin %> assign issue 1 john-doe --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  // eslint-disable-next-line no-restricted-syntax
  static override strict = false

  public async run(): Promise<void> {
    const { args, argv, flags } = await this.parse(AssignIssue)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    // Get all user IDs from argv (everything after the issue ID)
    // eslint-disable-next-line no-restricted-syntax
    const userIds = (argv as string[]).slice(1)
    if (userIds.length === 0) {
      this.error('At least one user ID is required')
    }

    const response = await daemonAssignIssue({
      projectPath: cwd,
      issueId: args.issueId,
      userIds,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.issue, null, 2))
      return
    }

    const issue = response.issue
    if (issue !== undefined) {
      this.log(
        `Assigned ${userIds.join(', ')} to issue #${issue.displayNumber}`
      )
      const assignees = issue.metadata.assignees
      this.log(
        `Current assignees: ${assignees.length > 0 ? assignees.join(', ') : 'none'}`
      )
    }
  }
}
