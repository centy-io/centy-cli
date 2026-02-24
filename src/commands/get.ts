// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import pluralize from 'pluralize'
import { daemonGetItem } from '../daemon/daemon-get-item.js'
import { projectFlag } from '../flags/project-flag.js'
import { formatGenericItem } from '../lib/get-item/format-generic-item.js'
import { handleGlobalGet } from '../lib/get-item/handle-global-get.js'
import { parseDisplayNumber } from '../lib/resolve-item-id/parse-display-number.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Get any item by type and identifier
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Get extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    type: Args.string({
      description: 'Item type (e.g., issue, doc, user, or custom type)',
      required: true,
    }),
    id: Args.string({
      description: 'Item ID (UUID, display number, or slug)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Get an item by type and identifier'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> get issue 1',
    '<%= config.bin %> get issue abc123-uuid',
    '<%= config.bin %> get doc getting-started',
    '<%= config.bin %> get user john-doe',
    '<%= config.bin %> get epic 1',
    '<%= config.bin %> get bug abc123-uuid --json',
    '<%= config.bin %> get issue 42 --global',
    '<%= config.bin %> get issue abc123-uuid --global',
    '<%= config.bin %> get issue 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    global: Flags.boolean({
      char: 'g',
      description: 'Search across all tracked projects',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Get)
    const itemType = pluralize(args.type)
    const cwd = await resolveProjectPath(flags.project)

    if (flags.global) {
      const throwError = (msg: string): never => this.error(msg)
      await handleGlobalGet(
        itemType,
        args.id,
        flags.json,
        this.log.bind(this),
        this.warn.bind(this),
        throwError
      )
      return
    }

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const displayNumber = parseDisplayNumber(args.id)
    const response = await daemonGetItem({
      projectPath: cwd,
      itemType,
      itemId: displayNumber !== undefined ? '' : args.id,
      displayNumber,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.item, null, 2))
      return
    }

    formatGenericItem(response.item!, this.log.bind(this))
  }
}
