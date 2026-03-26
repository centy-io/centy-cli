import { Args, Command, Flags } from '@oclif/core'
import { daemonUpdateItem } from '../../daemon/daemon-update-item.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Update a comment's body
 */

export default class CommentUpdate extends Command {
  static override args = {
    commentId: Args.string({
      description: 'Comment UUID to update',
      required: true,
    }),
    body: Args.string({
      description: 'New comment body text',
      required: true,
    }),
  }

  static override description = 'Update a comment'

  static override examples = [
    '<%= config.bin %> comment update abc123-uuid "Updated text"',
    '<%= config.bin %> comment update abc123-uuid "Updated text" --json',
    '<%= config.bin %> comment update abc123-uuid "Updated text" --project centy-daemon',
  ]

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CommentUpdate)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonUpdateItem({
      projectPath: cwd,
      itemType: 'comments',
      itemId: args.commentId,
      title: '',
      body: args.body,
      status: '',
      priority: 0,
      customFields: {},
      tags: [],
      clearTags: false,
    })

    if (!response.success) {
      this.error(response.error)
    }

    const item = response.item!

    if (flags.json) {
      this.log(
        JSON.stringify(
          {
            id: item.id,
            body: item.body,
          },
          null,
          2
        )
      )
      return
    }

    this.log(`Updated comment ${args.commentId}`)
  }
}
