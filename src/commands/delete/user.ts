// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonDeleteItem } from '../../daemon/daemon-delete-item.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Delete a user
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class DeleteUser extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'User ID',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Delete a user'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> delete user john-doe',
    '<%= config.bin %> delete user john-doe --force',
    '<%= config.bin %> delete user john-doe --project centy-daemon',
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
    const { args, flags } = await this.parse(DeleteUser)
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
          `Are you sure you want to delete user "${args.id}"? (y/N) `,
          resolve
        )
      })
      rl.close()
      if (answer.toLowerCase() !== 'y') {
        this.log('Cancelled.')
        return
      }
    }

    const response = await daemonDeleteItem({
      projectPath: cwd,
      itemType: 'users',
      itemId: args.id,
      force: false,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Deleted user "${args.id}"`)
  }
}
