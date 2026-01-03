// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonListUsers } from '../../daemon/daemon-list-users.js'
import type { User } from '../../daemon/types.js'
import { projectFlag } from '../../flags/project-flag.js'
import { ensureInitialized, NotInitializedError } from '../../utils/ensure-initialized.js'
import { groupByProject } from '../../utils/group-by-project.js'
import { listAcrossProjects } from '../../utils/list-across-projects.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

const formatUser = (user: User): string => {
  const gitNames = user.gitUsernames.length > 0 ? ` (git: ${user.gitUsernames.join(', ')})` : ''
  const email = user.email !== undefined && user.email !== '' ? ` <${user.email}>` : ''
  return `${user.id}: ${user.name}${email}${gitNames}`
}

// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class ListUsers extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all users in the project'
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['user:list']
  // eslint-disable-next-line no-restricted-syntax
  static override examples = ['<%= config.bin %> list users', '<%= config.bin %> list users --all']
  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    'git-username': Flags.string({ char: 'g', description: 'Filter by git username' }),
    json: Flags.boolean({ description: 'Output as JSON', default: false }),
    all: Flags.boolean({ char: 'a', description: 'List from all projects', default: false }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(ListUsers)
    if (flags.all) return this.listAll(flags)
    const cwd = await resolveProjectPath(flags.project)
    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) this.error(error.message)
      throw error instanceof Error ? error : new Error(String(error))
    }
    const response = await daemonListUsers({ projectPath: cwd, gitUsername: flags['git-username'] })
    if (flags.json) return void this.log(JSON.stringify(response.users, null, 2))
    if (response.users.length === 0) return void this.log('No users found.')
    this.log(`Found ${response.totalCount} user(s):\n`)
    for (const user of response.users) this.log(`  ${formatUser(user)}`)
  }

  private async listAll(flags: { 'git-username'?: string; json: boolean }): Promise<void> {
    const result = await listAcrossProjects<User>({
      async listFn(projectPath) {
        const r = await daemonListUsers({ projectPath, gitUsername: flags['git-username'] })
        return r.users
      },
    })
    if (flags.json) {
      const users = result.items.map(i => ({
        user: i.entity, projectName: i.projectName, projectPath: i.projectPath,
      }))
      return void this.log(JSON.stringify({ users, totalCount: users.length, errors: result.errors }, null, 2))
    }
    if (result.items.length === 0) {
      this.log('No users found across all projects.')
      return void this.printErrors(result.errors)
    }
    this.log(`Found ${result.items.length} user(s) across all projects:\n`)
    for (const [name, items] of groupByProject(result.items)) {
      this.log(`--- ${name} (${items.length} user(s)) ---`)
      for (const i of items) this.log(`  ${formatUser(i.entity)}`)
      this.log('')
    }
    this.printErrors(result.errors)
  }

  private printErrors(errors: string[]): void {
    if (errors.length > 0) {
      this.warn('Some projects could not be searched:')
      for (const err of errors) this.warn(`  - ${err}`)
    }
  }
}
