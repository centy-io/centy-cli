// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonDuplicateItem } from '../daemon/daemon-duplicate-item.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { projectFlag } from '../flags/project-flag.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'
import { toPlural } from '../utils/to-plural.js'
import { resolveItemId } from '../lib/resolve-item-id/resolve-item-id.js'

/**
 * Duplicate an item of any type to the same or a different project
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Duplicate extends Command {
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
  static override description =
    'Duplicate an item to the same or a different project'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> duplicate issue 1',
    '<%= config.bin %> duplicate epic 1 --title "Copy of epic"',
    '<%= config.bin %> duplicate bug abc123-uuid --to /path/to/other/project',
    '<%= config.bin %> duplicate epic 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    to: Flags.string({
      description: 'Target project path (defaults to same project)',
    }),
    title: Flags.string({
      char: 't',
      description: 'Title for the duplicate (defaults to "Copy of {original}")',
    }),
    'new-id': Flags.string({
      description: 'New ID for the copy (for slug-identified types)',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Duplicate)
    const itemType = toPlural(args.type)
    const sourceProjectPath = await resolveProjectPath(flags.project)
    const targetProjectPath =
      flags.to !== undefined
        ? await resolveProjectPath(flags.to)
        : sourceProjectPath

    try {
      await ensureInitialized(sourceProjectPath)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(`Source project: ${error.message}`)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (targetProjectPath !== sourceProjectPath) {
      try {
        await ensureInitialized(targetProjectPath)
      } catch (error) {
        if (error instanceof NotInitializedError) {
          this.error(`Target project: ${error.message}`)
        }
        throw error instanceof Error ? error : new Error(String(error))
      }
    }

    const itemId = await resolveItemId(
      args.id,
      itemType,
      sourceProjectPath,
      msg => this.error(msg)
    )
    const response = await daemonDuplicateItem({
      sourceProjectPath,
      itemType,
      itemId,
      targetProjectPath,
      newId: flags['new-id'] !== undefined ? flags['new-id'] : '',
      newTitle: flags.title !== undefined ? flags.title : '',
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
    const locationInfo =
      targetProjectPath !== sourceProjectPath ? ` in ${targetProjectPath}` : ''
    this.log(
      `Duplicated ${args.type} → ${displayNum} "${newItem.title}"${locationInfo}`
    )
  }
}
