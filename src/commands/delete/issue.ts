/* eslint-disable ddd/require-spec-file */
import { Args, Command, Flags } from '@oclif/core'

import { daemonDeleteIssue } from '../../daemon/daemon-delete-issue.js'
import { daemonIsInitialized } from '../../daemon/daemon-is-initialized.js'

/**
 * Delete an issue
 */
export default class DeleteIssue extends Command {
  static override args = {
    id: Args.string({
      description: 'Issue ID (UUID) or display number',
      required: true,
    }),
  }

  static override description = 'Delete an issue'

  static override examples = [
    '<%= config.bin %> delete issue 1',
    '<%= config.bin %> delete issue abc123-uuid',
    '<%= config.bin %> delete issue 1 --force',
  ]

  static override flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(DeleteIssue)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    if (!flags.force) {
      const readline = await import('node:readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      const answer = await new Promise<string>(resolve => {
        rl.question(
          `Are you sure you want to delete issue ${args.id}? (y/N) `,
          resolve
        )
      })
      rl.close()
      if (answer.toLowerCase() !== 'y') {
        this.log('Cancelled.')
        return
      }
    }

    const response = await daemonDeleteIssue({
      projectPath: cwd,
      issueId: args.id,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Deleted issue ${args.id}`)
  }
}
