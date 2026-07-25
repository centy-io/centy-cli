import { Args, Command, Flags } from '@oclif/core'
import { daemonListItems } from '../../daemon/daemon-list-items.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * List all comments for an item
 */

export default class CommentList extends Command {
  static override args = {
    itemId: Args.string({
      description: 'Parent item UUID to list comments for',
      required: true,
    }),
  }

  static override description = 'List all comments for an item'

  static override examples = [
    '<%= config.bin %> comment list abc123-uuid',
    '<%= config.bin %> comment list abc123-uuid --json',
    '<%= config.bin %> comment list abc123-uuid --project centy-daemon',
  ]

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(CommentList)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const filter = JSON.stringify({ customFields: { item_id: args.itemId } })

    const response = await daemonListItems({
      projectPath: cwd,
      itemType: 'comments',
      filter,
      limit: 0,
      offset: 0,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.items, null, 2))
      return
    }

    if (response.items.length === 0) {
      this.log('No comments found.')
      return
    }

    this.log(`Found ${response.totalCount} comment(s):\n`)
    for (const item of response.items) {
      const meta = item.metadata
      const author =
        meta !== undefined && meta.customFields['author'] !== undefined
          ? ` [${meta.customFields['author']}]`
          : ''
      this.log(`${item.id}${author}`)
      this.log(`  ${item.body}`)
    }
  }
}
