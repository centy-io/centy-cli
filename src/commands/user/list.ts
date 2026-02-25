// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonListUsers } from '../../daemon/daemon-list-users.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * List all users in the project
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class UserList extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['list:users']

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all users in the project'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> user list',
    '<%= config.bin %> list users',
    '<%= config.bin %> user list --json',
    '<%= config.bin %> user list --git-username johndoe',
    '<%= config.bin %> user list --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    'git-username': Flags.string({
      char: 'g',
      description: 'Filter by git username',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(UserList)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonListUsers({
      projectPath: cwd,
      gitUsername:
        flags['git-username'] !== undefined ? flags['git-username'] : '',
      includeDeleted: false,
    })

    if (flags.json) {
      this.log(JSON.stringify(response.users, null, 2))
      return
    }

    if (response.users.length === 0) {
      this.log('No users found.')
      return
    }

    this.log(`Found ${response.totalCount} user(s):\n`)
    for (const user of response.users) {
      const gitNames =
        user.gitUsernames.length > 0
          ? ` (git: ${user.gitUsernames.join(', ')})`
          : ''
      const email =
        user.email !== undefined && user.email !== '' ? ` <${user.email}>` : ''
      this.log(`  ${user.id}: ${user.name}${email}${gitNames}`)
    }
  }
}
