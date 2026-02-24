// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonListItems } from '../daemon/daemon-list-items.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Shorthand alias for `list issues`. List all issues.
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Issues extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['list:issues']

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Shorthand for `list issues`. List all issues'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> issues',
    '<%= config.bin %> issues --status open',
    '<%= config.bin %> issues --priority 1',
    '<%= config.bin %> issues --json',
    '<%= config.bin %> issues --limit 10',
    '<%= config.bin %> issues --project centy-daemon',
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
    'include-deleted': Flags.boolean({
      description: 'Include soft-deleted items',
      default: false,
    }),
    limit: Flags.integer({
      char: 'l',
      description: 'Maximum number of items to return (0 = no limit)',
      default: 0,
    }),
    offset: Flags.integer({
      description: 'Number of items to skip for pagination',
      default: 0,
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Issues)
    const itemType = 'issues'
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonListItems({
      projectPath: cwd,
      itemType,
      status: flags.status !== undefined ? flags.status : '',
      priority: flags.priority !== undefined ? flags.priority : 0,
      includeDeleted: flags['include-deleted'],
      limit: flags.limit !== undefined ? flags.limit : 0,
      offset: flags.offset !== undefined ? flags.offset : 0,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.items, null, 2))
      return
    }

    if (response.items.length === 0) {
      this.log(`No ${itemType} found.`)
      return
    }

    this.log(`Found ${response.totalCount} ${itemType}:\n`)
    for (const item of response.items) {
      const meta = item.metadata
      if (meta === undefined) {
        this.log(item.title)
        continue
      }
      const dn = meta.displayNumber > 0 ? `#${meta.displayNumber} ` : ''
      const status = meta.status !== '' ? ` [${meta.status}]` : ''
      const priority = meta.priority > 0 ? ` [P${meta.priority}]` : ''
      this.log(`${dn}${item.title}${status}${priority}`)
    }
  }
}
