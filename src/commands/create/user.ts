// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonCreateUser } from '../../daemon/daemon-create-user.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Create a new user in the project
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class CreateUser extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Create a new user in the project'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> create user --name "John Doe"',
    '<%= config.bin %> create user --id john-doe --name "John Doe" --email john@example.com',
    '<%= config.bin %> create user -n "Alice" -g alice-dev -g alice-work',
    '<%= config.bin %> create user --name "Bob" --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    id: Flags.string({
      char: 'i',
      description:
        'User ID (slug format, auto-generated from name if not provided)',
    }),
    name: Flags.string({
      char: 'n',
      description: 'Display name (required)',
      required: true,
    }),
    email: Flags.string({
      char: 'e',
      description: 'Email address',
    }),
    'git-username': Flags.string({
      char: 'g',
      description: 'Git username (can be specified multiple times)',
      multiple: true,
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(CreateUser)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonCreateUser({
      projectPath: cwd,
      id: flags.id !== undefined ? flags.id : '',
      name: flags.name,
      email: flags.email,
      gitUsernames: flags['git-username'],
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.user, null, 2))
      return
    }

    const user = response.user
    if (user !== undefined) {
      this.log(`Created user: ${user.id} (${user.name})`)
      if (user.email !== undefined && user.email !== '') {
        this.log(`  Email: ${user.email}`)
      }
      if (user.gitUsernames !== undefined && user.gitUsernames.length > 0) {
        this.log(`  Git usernames: ${user.gitUsernames.join(', ')}`)
      }
    }
  }
}
