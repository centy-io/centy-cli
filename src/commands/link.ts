// eslint-disable-next-line import/order
import { Args, Command } from '@oclif/core'

import { daemonCreateLink } from '../daemon/daemon-create-link.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { parseLinkTarget } from '../utils/parse-link-target.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Create a link between two entities
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Link extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    type: Args.string({
      description: 'Source entity type (e.g., issue, doc)',
      required: true,
    }),
    id: Args.string({
      description: 'Source entity ID or slug',
      required: true,
    }),
    linkType: Args.string({
      description: 'Link type (e.g., blocks, relates-to, parent-of)',
      required: true,
    }),
    target: Args.string({
      description:
        'Target entity as type:id (e.g., issue:2, doc:getting-started)',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Create a link between two entities'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> link issue 1 blocks issue:2',
    '<%= config.bin %> link doc getting-started relates-to issue:5',
    '<%= config.bin %> link issue 1 parent-of issue:3 --project my-project',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Link)
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

    const response = await daemonCreateLink({
      projectPath: cwd,
      sourceId: args.id,
      sourceType: args.type,
      targetId: parsed[1],
      targetType: parsed[0],
      linkType: args.linkType,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(
      `Created link: ${args.type} ${args.id} --[${args.linkType}]--> ${args.target}`
    )
  }
}
