// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetUser } from '../../daemon/daemon-get-user.js'
import { projectFlag } from '../../flags/project-flag.js'
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

    try {
      const user = await daemonGetUser({
        projectPath: cwd,
        userId: args.id,
      })

      if (flags.json) {
        this.log(JSON.stringify(user, null, 2))
        return
      }

      this.log(`User: ${user.id}`)
      this.log(`  Name: ${user.name}`)
      if (user.email !== undefined && user.email !== '') {
        this.log(`  Email: ${user.email}`)
      }
      if (user.gitUsernames !== undefined && user.gitUsernames.length > 0) {
        this.log(`  Git usernames: ${user.gitUsernames.join(', ')}`)
      }
      this.log(`  Created: ${user.createdAt}`)
      this.log(`  Updated: ${user.updatedAt}`)
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        this.error(`User "${args.id}" not found`)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }
  }
}
