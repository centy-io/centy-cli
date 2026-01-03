// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonDeletePr } from '../../daemon/daemon-delete-pr.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Delete a pull request
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class DeletePr extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'PR ID (UUID) or display number',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Delete a pull request'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> delete pr 1',
    '<%= config.bin %> delete pr abc123-uuid',
    '<%= config.bin %> delete pr 1 --force',
    '<%= config.bin %> delete pr 1 --project centy-daemon',
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
    const { args, flags } = await this.parse(DeletePr)
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
          `Are you sure you want to delete PR ${args.id}? (y/N) `,
          resolve
        )
      })
      rl.close()
      if (answer.toLowerCase() !== 'y') {
        this.log('Cancelled.')
        return
      }
    }

    const response = await daemonDeletePr({
      projectPath: cwd,
      prId: args.id,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Deleted PR ${args.id}`)
  }
}
