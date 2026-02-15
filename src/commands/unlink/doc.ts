// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonDeleteLink } from '../../daemon/daemon-delete-link.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Remove a link from a doc
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class UnlinkDoc extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    slug: Args.string({
      description: 'Doc slug',
      required: true,
    }),
    target: Args.string({
      description: 'Target entity as type:id (e.g., issue:2, doc:architecture)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Remove a link from a doc'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> unlink doc getting-started issue:5',
    '<%= config.bin %> unlink doc architecture doc:api-design --type relates-to',
    '<%= config.bin %> unlink doc vision issue:10 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    type: Flags.string({
      description:
        'Specific link type to remove (removes all link types if omitted)',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(UnlinkDoc)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const [targetType, targetId] = parseTarget(args.target)
    if (targetType === undefined || targetId === undefined) {
      this.error(
        'Invalid target format. Use type:id (e.g., issue:2, doc:getting-started)'
      )
    }

    const response = await daemonDeleteLink({
      projectPath: cwd,
      sourceId: args.slug,
      sourceType: 'doc',
      targetId,
      targetType,
      linkType: flags.type,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(
      `Removed ${response.deletedCount} link(s) from doc ${args.slug} to ${args.target}`
    )
  }
}

function parseTarget(target: string): [string | undefined, string | undefined] {
  const colonIndex = target.indexOf(':')
  if (colonIndex === -1) {
    return [undefined, undefined]
  }
  const type = target.slice(0, colonIndex)
  const id = target.slice(colonIndex + 1)
  if (type === '' || id === '') {
    return [undefined, undefined]
  }
  return [type, id]
}
