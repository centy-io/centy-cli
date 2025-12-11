/* eslint-disable ddd/require-spec-file */
import { Command, Flags } from '@oclif/core'

import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'
import { daemonListIssues } from '../../daemon/daemon-list-issues.js'

/**
 * List all issues in the .centy/issues folder
 */
export default class ListIssues extends Command {
  static override description = 'List all issues'

  static override examples = [
    '<%= config.bin %> list issues',
    '<%= config.bin %> list issues --status open',
    '<%= config.bin %> list issues --priority 1',
  ]

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
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListIssues)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    const response = await daemonListIssues({
      projectPath: cwd,
      status: flags.status,
      priority: flags.priority,
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
      this.log(
        `#${issue.displayNumber} [${priority}] [${status}] ${issue.title}`
      )
    }
  }
}
