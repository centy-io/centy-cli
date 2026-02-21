// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonListItems } from '../daemon/daemon-list-items.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'
import { toPlural } from '../utils/to-plural.js'

/**
 * List items of any type
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class List extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    type: Args.string({
      description: 'Item type (e.g., issue, doc, epic, or custom type)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List items of any type'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> list issues',
    '<%= config.bin %> list epics',
    '<%= config.bin %> list epics --status open',
    '<%= config.bin %> list epics --priority 1',
    '<%= config.bin %> list bugs --json',
    '<%= config.bin %> list issues --project centy-daemon',
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
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(List)
    const itemType = toPlural(args.type)
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
      limit: 0,
      offset: 0,
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
      const displayNum =
        meta !== undefined && meta.displayNumber > 0
          ? `#${meta.displayNumber} `
          : ''
      const status =
        meta !== undefined && meta.status !== '' ? ` [${meta.status}]` : ''
      const priority =
        meta !== undefined && meta.priority > 0 ? ` [P${meta.priority}]` : ''
      this.log(`${displayNum}${item.title}${status}${priority}`)
    }
  }
}
