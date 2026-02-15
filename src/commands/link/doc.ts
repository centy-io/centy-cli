// eslint-disable-next-line import/order
import { Args, Command } from '@oclif/core'

import { daemonCreateLink } from '../../daemon/daemon-create-link.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Create a link from a doc to another entity
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class LinkDoc extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    slug: Args.string({
      description: 'Doc slug',
      required: true,
    }),
    linkType: Args.string({
      description: 'Link type (e.g., blocks, relates-to, parent-of)',
      required: true,
    }),
    target: Args.string({
      description: 'Target entity as type:id (e.g., issue:2, doc:architecture)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Create a link from a doc to another entity'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> link doc getting-started relates-to issue:5',
    '<%= config.bin %> link doc architecture parent-of doc:api-design',
    '<%= config.bin %> link doc vision relates-to issue:10 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(LinkDoc)
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

    const response = await daemonCreateLink({
      projectPath: cwd,
      sourceId: args.slug,
      sourceType: 'doc',
      targetId,
      targetType,
      linkType: args.linkType,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(
      `Created link: doc ${args.slug} --[${args.linkType}]--> ${args.target}`
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
