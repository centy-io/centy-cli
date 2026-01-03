// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonMoveIssue } from '../../daemon/daemon-move-issue.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Move an issue to a different project
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class MoveIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'Issue ID (UUID) or display number',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Move an issue to a different project'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> move issue 1 --to /path/to/target/project',
    '<%= config.bin %> move issue abc123-uuid --to ../other-project',
    '<%= config.bin %> move issue 5 --to ~/projects/target --project ./source',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    to: Flags.string({
      char: 't',
      description: 'Target project path',
      required: true,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(MoveIssue)
    const sourceProjectPath = await resolveProjectPath(flags.project)
    const targetProjectPath = await resolveProjectPath(flags.to)

    // Ensure source project is initialized
    try {
      await ensureInitialized(sourceProjectPath)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(`Source project: ${error.message}`)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    // Ensure target project is initialized
    try {
      await ensureInitialized(targetProjectPath)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(`Target project: ${error.message}`)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (sourceProjectPath === targetProjectPath) {
      this.error('Source and target project cannot be the same.')
    }

    const response = await daemonMoveIssue({
      sourceProjectPath,
      issueId: args.id,
      targetProjectPath,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(
      `Moved issue #${response.oldDisplayNumber} → #${response.issue.displayNumber} in ${targetProjectPath}`
    )
  }
}
