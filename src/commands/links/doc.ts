// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonListLinks } from '../../daemon/daemon-list-links.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * List all links for a doc
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class LinksDoc extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    slug: Args.string({
      description: 'Doc slug',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'List all links for a doc'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> links doc getting-started',
    '<%= config.bin %> links doc architecture --json',
    '<%= config.bin %> links doc vision --project centy-daemon',
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
    const { args, flags } = await this.parse(LinksDoc)
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
      entityId: args.slug,
      entityType: 'doc',
    })

    if (flags.json) {
      this.log(JSON.stringify(response.links, null, 2))
      return
    }

    if (response.links.length === 0) {
      this.log(`No links found for doc ${args.slug}.`)
      return
    }

    this.log(`Found ${response.totalCount} link(s) for doc ${args.slug}:\n`)
    for (const link of response.links) {
      this.log(`  ${link.linkType} --> ${link.targetType}:${link.targetId}`)
    }
  }
}
