// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonUpdateUser } from '../../daemon/daemon-update-user.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Update a user
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class UpdateUser extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['edit:user']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'User ID',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Update a user'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> update user john-doe --name "John D."',
    '<%= config.bin %> update user john-doe --email john.new@example.com',
    '<%= config.bin %> update user john-doe --git-username johndoe --git-username john-work',
    '<%= config.bin %> update user john-doe --name "John" --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    name: Flags.string({
      char: 'n',
      description: 'New display name',
    }),
    email: Flags.string({
      char: 'e',
      description: 'New email address',
    }),
    'git-username': Flags.string({
      char: 'g',
      description:
        'Git username (replaces all existing, can be specified multiple times)',
      multiple: true,
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UpdateUser)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonUpdateUser({
      projectPath: cwd,
      userId: args.id,
      name: flags.name !== undefined ? flags.name : '',
      email: flags.email !== undefined ? flags.email : '',
      gitUsernames:
        flags['git-username'] !== undefined ? flags['git-username'] : [],
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.user, null, 2))
      return
    }

    const user = response.user
    if (user === undefined) {
      return
    }

    this.log(`Updated user: ${user.id}`)
    this.log(`  Name: ${user.name}`)
    if (user.email !== undefined && user.email !== '') {
      this.log(`  Email: ${user.email}`)
    }
    if (user.gitUsernames !== undefined && user.gitUsernames.length > 0) {
      this.log(`  Git usernames: ${user.gitUsernames.join(', ')}`)
    }
  }
}
