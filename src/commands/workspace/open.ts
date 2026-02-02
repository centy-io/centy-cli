// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonOpenInTempVscode } from '../../daemon/daemon-open-in-temp-vscode.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Open an issue in a temporary VS Code workspace
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class WorkspaceOpen extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Open an issue in a temporary VS Code workspace'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> workspace open 1',
    '<%= config.bin %> workspace open abc-123 --ttl 24',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    issueId: Args.string({
      description: 'Issue ID or display number',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    project: projectFlag,
    ttl: Flags.integer({
      description: 'Workspace TTL in hours (default: 12)',
    }),
    agent: Flags.string({
      description: 'Agent name to use (default: project default)',
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(WorkspaceOpen)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonOpenInTempVscode({
      projectPath: cwd,
      issueId: args.issueId,
      action: 'PLAN',
      agentName: flags.agent,
      ttlHours: flags.ttl,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (response.workspaceReused) {
      this.log(`Reopened existing workspace at: ${response.workspacePath}`)
      if (response.originalCreatedAt) {
        this.log(`Originally created: ${response.originalCreatedAt}`)
      }
    } else {
      this.log(`Created workspace at: ${response.workspacePath}`)
    }

    this.log(`Issue: #${response.issueDisplayNumber} - ${response.issueTitle}`)
    this.log(`Expires: ${response.expiresAt}`)

    if (response.vscodeOpened) {
      this.log('VS Code opened successfully')
    } else {
      this.warn('VS Code could not be opened automatically. Open manually.')
    }
  }
}
