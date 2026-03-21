import { Args, Command, Flags } from '@oclif/core'
import { daemonDeleteLink } from '../daemon/daemon-delete-link.js'
import { LinkTargetType } from '../daemon/types.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { parseLinkTarget } from '../utils/parse-link-target.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Remove a link between two entities
 */

export default class Unlink extends Command {
  static override args = {
    type: Args.string({
      description: 'Source entity type (e.g., issue, doc)',
      required: true,
    }),
    id: Args.string({
      description: 'Source entity ID or slug',
      required: true,
    }),
    target: Args.string({
      description:
        'Target entity as type:id (e.g., issue:2, doc:getting-started)',
      required: true,
    }),
  }

  static override description = 'Remove a link between two entities'

  static override examples = [
    '<%= config.bin %> unlink issue 1 issue:2',
    '<%= config.bin %> unlink issue 1 issue:2 --type blocks',
    '<%= config.bin %> unlink doc getting-started issue:5 --project my-project',
  ]

  static override flags = {
    type: Flags.string({
      description:
        'Specific link type to remove (removes all link types if omitted)',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Unlink)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const parsed = parseLinkTarget(args.target)
    if (parsed === undefined) {
      this.error(
        'Invalid target format. Use type:id (e.g., issue:2, doc:getting-started)'
      )
    }

    const response = await daemonDeleteLink({
      projectPath: cwd,
      sourceId: args.id,

      sourceType: args.type as LinkTargetType,
      targetId: parsed[1],

      targetType: parsed[0] as LinkTargetType,
      linkType: flags.type !== undefined ? flags.type : '',
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(
      `Removed ${response.deletedCount} link(s) from ${args.type} ${args.id} to ${args.target}`
    )
  }
}
