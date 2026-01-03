// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonDuplicateIssue } from '../../daemon/daemon-duplicate-issue.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Duplicate an issue (same or different project)
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class DuplicateIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'Issue ID (UUID) or display number',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Duplicate an issue (same project or different project)'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> duplicate issue 1',
    '<%= config.bin %> duplicate issue 1 --title "New feature branch"',
    '<%= config.bin %> duplicate issue abc123-uuid --to /path/to/other/project',
    '<%= config.bin %> duplicate issue 5 --to ../other --title "Copy for testing"',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    to: Flags.string({
      char: 't',
      description:
        'Target project path (defaults to same project if not specified)',
    }),
    title: Flags.string({
      description: 'Title for the duplicate (defaults to "Copy of {original}")',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DuplicateIssue)
    const sourceProjectPath = await resolveProjectPath(flags.project)
    const targetProjectPath = flags.to
      ? await resolveProjectPath(flags.to)
      : sourceProjectPath

    // Ensure source project is initialized
    try {
      await ensureInitialized(sourceProjectPath)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(`Source project: ${error.message}`)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    // Ensure target project is initialized (if different)
    if (targetProjectPath !== sourceProjectPath) {
      try {
        await ensureInitialized(targetProjectPath)
      } catch (error) {
        if (error instanceof NotInitializedError) {
          this.error(`Target project: ${error.message}`)
        }
        throw error instanceof Error ? error : new Error(String(error))
      }
    }

    const response = await daemonDuplicateIssue({
      sourceProjectPath,
      issueId: args.id,
      targetProjectPath,
      newTitle: flags.title,
    })

    if (!response.success) {
      this.error(response.error)
    }

    const locationInfo =
      targetProjectPath !== sourceProjectPath
        ? ` in ${targetProjectPath}`
        : ' in current project'

    this.log(
      `Duplicated issue → #${response.issue.displayNumber} "${response.issue.title}"${locationInfo}`
    )
  }
}
