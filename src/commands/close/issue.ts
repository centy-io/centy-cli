// eslint-disable-next-line import/order
import { Args, Command } from '@oclif/core'

import { daemonUpdateIssue } from '../../daemon/daemon-update-issue.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Close an issue by setting its status to closed
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class CloseIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'Issue ID (UUID) or display number',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Close an issue'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> close issue 1',
    '<%= config.bin %> close issue abc123-uuid',
    '<%= config.bin %> close issue 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CloseIssue)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonUpdateIssue({
      projectPath: cwd,
      issueId: args.id,
      status: 'closed',
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Closed issue #${response.issue.displayNumber}`)
  }
}
