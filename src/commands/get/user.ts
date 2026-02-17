// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetItem } from '../../daemon/daemon-get-item.js'
import { projectFlag } from '../../flags/project-flag.js'
import { formatGenericItem } from '../../lib/get-item/format-generic-item.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Get a user by ID
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class GetUser extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'User ID',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Get a user by ID'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> get user john-doe',
    '<%= config.bin %> get user john-doe --json',
    '<%= config.bin %> get user john-doe --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetUser)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonGetItem({
      projectPath: cwd,
      itemType: 'users',
      itemId: args.id,
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
