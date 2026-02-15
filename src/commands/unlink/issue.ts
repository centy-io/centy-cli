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
 * Remove a link from an issue
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class UnlinkIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'Issue ID (UUID) or display number',
      required: true,
    }),
    target: Args.string({
      description:
        'Target entity as type:id (e.g., issue:2, doc:getting-started)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Remove a link from an issue'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> unlink issue 1 issue:2',
    '<%= config.bin %> unlink issue 1 issue:2 --type blocks',
    '<%= config.bin %> unlink issue 1 doc:getting-started --project centy-daemon',
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
    const { args, flags } = await this.parse(UnlinkIssue)
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
      sourceId: args.id,
      sourceType: 'issue',
      targetId,
      targetType,
      linkType: flags.type,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(
      `Removed ${response.deletedCount} link(s) from issue ${args.id} to ${args.target}`
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
