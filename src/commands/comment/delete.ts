import { Args, Command, Flags } from '@oclif/core'
import { daemonDeleteItem } from '../../daemon/daemon-delete-item.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Delete a comment
 */

export default class CommentDelete extends Command {
  static override args = {
    commentId: Args.string({
      description: 'Comment UUID to delete',
      required: true,
    }),
  }

  static override description = 'Delete a comment'

  static override examples = [
    '<%= config.bin %> comment delete abc123-uuid',
    '<%= config.bin %> comment delete abc123-uuid --force',
    '<%= config.bin %> comment delete abc123-uuid --project centy-daemon',
  ]

  static override flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
    json: Flags.boolean({
      description: 'Output as JSON (also skips confirmation prompt)',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CommentDelete)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (!flags.force && !flags.json) {
      const readline = await import('node:readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      const answer = await new Promise<string>(resolve => {
        rl.question(
          `Are you sure you want to delete comment ${args.commentId}? (y/N) `,
          resolve
        )
      })
      rl.close()
      if (answer.toLowerCase() !== 'y') {
        this.log('Cancelled.')
        return
      }
    }

    const response = await daemonDeleteItem({
      projectPath: cwd,
      itemType: 'comments',
      itemId: args.commentId,
      force: false,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(
        JSON.stringify(
          {
            id: args.commentId,
            deleted: true,
          },
          null,
          2
        )
      )
      return
    }

    this.log(`Deleted comment ${args.commentId}`)
  }
}
