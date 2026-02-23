// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import pluralize from 'pluralize'
import { daemonDeleteItem } from '../daemon/daemon-delete-item.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'
import { resolveItemId } from '../lib/resolve-item-id/resolve-item-id.js'

/**
 * Delete an item by type and identifier
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Delete extends Command {
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
  static override description = 'Delete an item by type and identifier'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> delete issue 1',
    '<%= config.bin %> delete epic 1 --force',
    '<%= config.bin %> delete bug abc123-uuid',
    '<%= config.bin %> delete epic 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Delete)
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

    if (!flags.force) {
      const readline = await import('node:readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      const answer = await new Promise<string>(resolve => {
        rl.question(
          `Are you sure you want to delete ${args.type} ${args.id}? (y/N) `,
          resolve
        )
      })
      rl.close()
      if (answer.toLowerCase() !== 'y') {
        this.log('Cancelled.')
        return
      }
    }

    const itemId = await resolveItemId(args.id, itemType, cwd, msg =>
      this.error(msg)
    )
    const response = await daemonDeleteItem({
      projectPath: cwd,
      itemType,
      itemId,
      force: false,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Deleted ${args.type} ${args.id}`)
  }
}
