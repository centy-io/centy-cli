import { Args, Command, Flags } from '@oclif/core'
import { daemonCreateItem } from '../../daemon/daemon-create-item.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Add a comment to an item
 */

export default class CommentAdd extends Command {
  static override args = {
    itemId: Args.string({
      description: 'Parent item UUID to comment on',
      required: true,
    }),
    body: Args.string({
      description: 'Comment body text',
      required: true,
    }),
  }

  static override description = 'Add a comment to an item'

  static override examples = [
    '<%= config.bin %> comment add abc123-uuid "This looks good"',
    '<%= config.bin %> comment add abc123-uuid "Nice work" --author alice',
    '<%= config.bin %> comment add abc123-uuid "Fix needed" --author bob --json',
  ]

  static override flags = {
    author: Flags.string({
      char: 'a',
      description: 'Comment author',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CommentAdd)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const customFields: Record<string, string> = {
      item_id: args.itemId,
    }
    if (flags.author !== undefined) {
      customFields['author'] = flags.author
    }

    const response = await daemonCreateItem({
      projectPath: cwd,
      itemType: 'comments',
      title: '',
      body: args.body,
      status: '',
      priority: 0,
      customFields,
      tags: [],
      projects: [],
    })

    if (!response.success) {
      const errorMsg =
        response.error !== '' ? response.error : 'Failed to create comment'
      this.error(errorMsg)
    }

    const item = response.item!

    if (flags.json) {
      this.log(
        JSON.stringify(
          {
            id: item.id,
            body: item.body,
            itemId: args.itemId,
            author: flags.author,
          },
          null,
          2
        )
      )
      return
    }

    this.log(`Added comment on ${args.itemId}`)
    this.log(`  ID: ${item.id}`)
  }
}
