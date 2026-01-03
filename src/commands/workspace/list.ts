// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { daemonListTempWorkspaces } from '../../daemon/daemon-list-temp-workspaces.js'
import { projectFlag } from '../../flags/project-flag.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * List all temporary workspaces
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class WorkspaceList extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all temporary workspaces'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> workspace list',
    '<%= config.bin %> workspace list --include-expired',
    '<%= config.bin %> workspace list --project ./my-project',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    project: projectFlag,
    'include-expired': Flags.boolean({
      description: 'Include expired workspaces',
      default: false,
    }),
    all: Flags.boolean({
      description: 'Show workspaces from all projects',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(WorkspaceList)

    let sourceProjectPath: string | undefined
    if (!flags.all && flags.project) {
      sourceProjectPath = await resolveProjectPath(flags.project)
    } else if (!flags.all) {
      try {
        sourceProjectPath = await resolveProjectPath(undefined)
      } catch {
        // If no project can be resolved, show all workspaces
        sourceProjectPath = undefined
      }
    }

    const response = await daemonListTempWorkspaces({
      includeExpired: flags['include-expired'],
      sourceProjectPath,
    })

    if (response.workspaces.length === 0) {
      this.log('No temporary workspaces found')
      return
    }

    this.log(`Found ${response.totalCount} workspace(s):`)
    for (const ws of response.workspaces) {
      this.log(`\n  Path: ${ws.workspacePath}`)
      this.log(`  Issue: #${ws.issueDisplayNumber} - ${ws.issueTitle}`)
      this.log(`  Action: ${ws.action.toLowerCase()}`)
      this.log(`  Created: ${ws.createdAt}`)
      this.log(`  Expires: ${ws.expiresAt}`)
    }

    if (response.expiredCount > 0) {
      this.log(
        `\n${response.expiredCount} expired workspace(s) not shown. Use --include-expired to see them.`
      )
    }
  }
}
