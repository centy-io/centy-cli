// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonListIssues } from '../../daemon/daemon-list-issues.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * List all issues in the .centy/issues folder
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ListIssues extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all issues'

  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['issue:list']

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> list issues',
    '<%= config.bin %> list issues --status open',
    '<%= config.bin %> list issues --priority 1',
    '<%= config.bin %> list issues --project centy-daemon',
    '<%= config.bin %> list issues --draft',
    '<%= config.bin %> list issues --no-draft',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    status: Flags.string({
      char: 's',
      description: 'Filter by status (e.g., open, in-progress, closed)',
    }),
    priority: Flags.integer({
      char: 'p',
      description: 'Filter by priority level (1 = highest)',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    draft: Flags.boolean({
      description:
        'Filter by draft status (--draft for drafts only, --no-draft for non-drafts)',
      allowNo: true,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListIssues)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonListIssues({
      projectPath: cwd,
      status: flags.status,
      priority: flags.priority,
      draft: flags.draft,
    })

    if (flags.json) {
      this.log(JSON.stringify(response.issues, null, 2))
      return
    }

    if (response.issues.length === 0) {
      this.log('No issues found.')
      return
    }

    this.log(`Found ${response.totalCount} issue(s):\n`)
    for (const issue of response.issues) {
      const meta = issue.metadata
      const priority =
        meta !== undefined
          ? meta.priorityLabel !== ''
            ? meta.priorityLabel
            : `P${meta.priority}`
          : 'P?'
      const status = meta !== undefined ? meta.status : 'unknown'
      const draftIndicator =
        meta !== undefined && meta.draft === true ? ' [DRAFT]' : ''
      this.log(
        `#${issue.displayNumber} [${priority}] [${status}]${draftIndicator} ${issue.title}`
      )
    }
  }
}
