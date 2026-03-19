// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import pluralize from 'pluralize'
import { daemonListItems } from '../../daemon/daemon-list-items.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { formatItemLine } from '../../lib/list-items/format-item-line.js'
import {
  buildFilter,
  runGlobalList,
} from '../../lib/list-items/run-global-list.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * List items of any type using the generic ListItems RPC
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ListItems extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    type: Args.string({
      description: 'Item type (e.g., issues, docs, bugs)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List items of any type'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> list issues',
    '<%= config.bin %> list issues --status open --priority 1',
    '<%= config.bin %> list docs --json --limit 10',
    '<%= config.bin %> list bugs --project centy-daemon',
    '<%= config.bin %> list issues --global',
    '<%= config.bin %> list issues --global --status open --json',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    status: Flags.string({ description: 'Filter by status' }),
    priority: Flags.integer({ description: 'Filter by priority level' }),
    limit: Flags.integer({
      description: 'Limit number of results (0 = no limit)',
      default: 0,
    }),
    offset: Flags.integer({ description: 'Offset for pagination', default: 0 }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
    project: projectFlag,
    global: Flags.boolean({
      char: 'g',
      description: 'Query items across all tracked projects',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(ListItems)
    const itemType = pluralize(args.type)
    const filter = buildFilter(flags.status, flags.priority)
    if (flags.global) {
      await runGlobalList(this, itemType, filter, flags.limit, flags.offset, flags.json) // prettier-ignore
      return
    }
    const cwd = await resolveProjectPath(flags.project)
    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) this.error(error.message)
      throw error instanceof Error ? error : new Error(String(error))
    }
    const response = await daemonListItems({
      projectPath: cwd,
      itemType,
      limit: flags.limit,
      offset: flags.offset,
      filter,
    })
    if (!response.success) this.error(response.error)
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
      this.log(`${formatItemLine(item)}\n  ID: ${item.id}`)
    }
  }
}
