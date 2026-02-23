// eslint-disable-next-line import/order
import { Args, Command } from '@oclif/core'

import pluralize from 'pluralize'
import { daemonRestoreItem } from '../daemon/daemon-restore-item.js'
import { projectFlag } from '../flags/project-flag.js'
import { resolveItemId } from '../lib/resolve-item-id/resolve-item-id.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Restore a soft-deleted item by type and identifier
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Restore extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    type: Args.string({
      description: 'Item type (e.g., issue, epic, or custom type)',
      required: true,
    }),
    id: Args.string({
      description: 'Item ID (UUID, display number, or slug)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Restore a soft-deleted item'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> restore issue 1',
    '<%= config.bin %> restore epic abc123-uuid',
    '<%= config.bin %> restore bug 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Restore)
    const itemType = pluralize(args.type)
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

    const response = await daemonRestoreItem({
      projectPath: cwd,
      itemType,
      itemId,
    })

    if (!response.success) {
      this.error(response.error)
    }

    const item = response.item!
    const meta = item.metadata
    const displayNum =
      meta !== undefined && meta.displayNumber > 0
        ? `#${meta.displayNumber}`
        : item.id

    this.log(`Restored ${args.type} ${displayNum}`)
  }
}
