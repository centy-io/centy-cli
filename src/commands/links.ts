// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonListLinks } from '../daemon/daemon-list-links.js'
import { projectFlag } from '../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * List all links for an entity
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Links extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    type: Args.string({
      description: 'Entity type (e.g., issue, doc)',
      required: true,
    }),
    id: Args.string({
      description: 'Entity ID or slug',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all links for an entity'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> links issue 1',
    '<%= config.bin %> links doc getting-started --json',
    '<%= config.bin %> links issue 1 --project my-project',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Links)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonListLinks({
      projectPath: cwd,
      entityId: args.id,
      entityType: args.type,
    })

    if (flags.json) {
      this.log(JSON.stringify(response.links, null, 2))
      return
    }

    if (response.links.length === 0) {
      this.log(`No links found for ${args.type} ${args.id}.`)
      return
    }

    this.log(
      `Found ${response.totalCount} link(s) for ${args.type} ${args.id}:\n`
    )
    for (const link of response.links) {
      this.log(`  ${link.linkType} --> ${link.targetType}:${link.targetId}`)
    }
  }
}
