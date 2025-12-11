/* eslint-disable ddd/require-spec-file */
import { Command, Flags } from '@oclif/core'

import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'
import { daemonListPrs } from '../../daemon/daemon-list-prs.js'

/**
 * List all pull requests in the .centy/prs folder
 */
export default class ListPrs extends Command {
  static override description = 'List all pull requests'

  static override examples = [
    '<%= config.bin %> list prs',
    '<%= config.bin %> list prs --status open',
    '<%= config.bin %> list prs --source feature-branch',
    '<%= config.bin %> list prs --target main',
  ]

  static override flags = {
    status: Flags.string({
      char: 's',
      description: 'Filter by status (draft, open, merged, closed)',
    }),
    source: Flags.string({
      description: 'Filter by source branch',
    }),
    target: Flags.string({
      description: 'Filter by target branch',
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
    const { flags } = await this.parse(ListPrs)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    const response = await daemonListPrs({
      projectPath: cwd,
      status: flags.status,
      sourceBranch: flags.source,
      targetBranch: flags.target,
      priority: flags.priority,
    })

    if (flags.json) {
      this.log(JSON.stringify(response.prs, null, 2))
      return
    }

    if (response.prs.length === 0) {
      this.log('No pull requests found.')
      return
    }

    this.log(`Found ${response.totalCount} PR(s):\n`)
    for (const pr of response.prs) {
      const meta = pr.metadata
      const priority =
        meta !== undefined
          ? meta.priorityLabel !== ''
            ? meta.priorityLabel
            : `P${meta.priority}`
          : 'P?'
      const status = meta !== undefined ? meta.status : 'unknown'
      const branches =
        meta !== undefined
          ? `${meta.sourceBranch} -> ${meta.targetBranch}`
          : '? -> ?'
      this.log(`#${pr.displayNumber} [${priority}] [${status}] ${pr.title}`)
      this.log(`    ${branches}`)
    }
  }
}
