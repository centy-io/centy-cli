// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonMoveItem } from '../daemon/daemon-move-item.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { projectFlag } from '../flags/project-flag.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'
import { toPlural } from '../utils/to-plural.js'
import { resolveItemId } from '../lib/resolve-item-id/resolve-item-id.js'

/**
 * Move an item of any type to a different project
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Move extends Command {
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
  static override description = 'Move an item to a different project'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> move issue 1 --to /path/to/target/project',
    '<%= config.bin %> move epic 1 --to ../other-project',
    '<%= config.bin %> move bug abc123-uuid --to ~/projects/target',
    '<%= config.bin %> move epic 1 --to /other --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    to: Flags.string({
      char: 't',
      description: 'Target project path',
      required: true,
    }),
    'new-id': Flags.string({
      description: 'New ID for the item in the target (for slug renames)',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Move)
    const itemType = toPlural(args.type)
    const sourceProjectPath = await resolveProjectPath(flags.project)
    const targetProjectPath = await resolveProjectPath(flags.to)

    try {
      await ensureInitialized(sourceProjectPath)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(`Source project: ${error.message}`)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    try {
      await ensureInitialized(targetProjectPath)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(`Target project: ${error.message}`)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (sourceProjectPath === targetProjectPath) {
      this.error('Source and target project cannot be the same.')
    }

    const itemId = await resolveItemId(
      args.id,
      itemType,
      sourceProjectPath,
      msg => this.error(msg)
    )
    const response = await daemonMoveItem({
      sourceProjectPath,
      targetProjectPath,
      itemType,
      itemId,
      newId: flags['new-id'] !== undefined ? flags['new-id'] : '',
    })

    if (!response.success) {
      this.error(response.error)
    }

    const newItem = response.item!
    const meta = newItem.metadata
    const displayNum =
      meta !== undefined && meta.displayNumber > 0
        ? `#${meta.displayNumber}`
        : newItem.id
    this.log(
      `Moved ${args.type} → ${displayNum} "${newItem.title}" in ${targetProjectPath}`
    )
  }
}
