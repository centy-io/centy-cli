// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonUpdateItem } from '../daemon/daemon-update-item.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'
import { toPlural } from '../utils/to-plural.js'
import { resolveItemId } from '../lib/resolve-item-id/resolve-item-id.js'

/**
 * Close an item by setting its status to closed
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Close extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    type: Args.string({
      description: 'Item type (e.g., issue, epic, or custom type)',
      required: true,
    }),
    id: Args.string({
      description: 'Item ID (UUID or display number)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Close an item by setting its status to closed'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> close issue 1',
    '<%= config.bin %> close epic 1',
    '<%= config.bin %> close issue abc123-uuid',
    '<%= config.bin %> close epic 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    project: projectFlag,
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Close)
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

    const itemId = await resolveItemId(args.id, itemType, cwd, msg =>
      this.error(msg)
    )
    const response = await daemonUpdateItem({
      projectPath: cwd,
      itemType,
      itemId,
      status: 'closed',
      title: '',
      body: '',
      priority: 0,
      customFields: {},
    })

    if (!response.success) {
      this.error(response.error)
    }

    const item = response.item!
    const meta = item.metadata
    const displayNum =
      meta !== undefined && meta.displayNumber > 0
        ? `#${meta.displayNumber}`
        : itemId

    if (flags.json) {
      this.log(
        JSON.stringify(
          {
            type: args.type,
            id: item.id,
            displayNumber: meta !== undefined ? meta.displayNumber : undefined,
            status: 'closed',
          },
          null,
          2
        )
      )
    } else {
      this.log(`Closed ${args.type} ${displayNum}`)
    }
  }
}
