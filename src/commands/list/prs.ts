import { Command, Flags } from '@oclif/core'

import { daemonListPrs } from '../../daemon/daemon-list-prs.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

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
    '<%= config.bin %> list prs --project centy-daemon',
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
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListPrs)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
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
