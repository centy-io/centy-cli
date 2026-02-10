// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetDoc } from '../../daemon/daemon-get-doc.js'
import { daemonGetDocsBySlug } from '../../daemon/daemon-get-docs-by-slug.js'
import { projectFlag } from '../../flags/project-flag.js'
import { checkCrossProjectDoc } from '../../lib/get-doc/cross-project-hint.js'
import { formatDocPlain } from '../../lib/get-doc/format-doc-output.js'
import { handleGlobalDocSearch } from '../../lib/get-doc/handle-global-search.js'
import { handleDocNotInitialized } from '../../lib/get-doc/handle-not-initialized.js'
import { ensureInitialized } from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Get a single doc by slug
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class GetDoc extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['show:doc']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    slug: Args.string({
      description: 'Doc slug',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Get a documentation file by slug'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> get doc getting-started',
    '<%= config.bin %> get doc api-reference --json',
    '<%= config.bin %> get doc getting-started --global',
    '<%= config.bin %> get doc getting-started -g --json',
    '<%= config.bin %> get doc api-reference --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    global: Flags.boolean({
      char: 'g',
      description: 'Search across all tracked projects',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetDoc)
    const cwd = await resolveProjectPath(flags.project)

    if (flags.global) {
      const result = await daemonGetDocsBySlug({ slug: args.slug })
      if (flags.json) {
        this.log(JSON.stringify(result, null, 2))
        return
      }
      handleGlobalDocSearch(
        result,
        args.slug,
        this.log.bind(this),
        this.warn.bind(this)
      )
      return
    }

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      const result = await handleDocNotInitialized(error, args.slug, flags.json)
      if (result !== null) {
        if (result.jsonOutput !== undefined) {
          this.log(JSON.stringify(result.jsonOutput, null, 2))
          this.exit(1)
        }
        this.error(result.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    await this.fetchAndDisplayDoc(cwd, args.slug, flags.json)
  }

  private async fetchAndDisplayDoc(
    cwd: string,
    slug: string,
    jsonMode: boolean
  ): Promise<void> {
    try {
      const doc = await daemonGetDoc({ projectPath: cwd, slug })
      if (jsonMode) {
        this.log(JSON.stringify(doc, null, 2))
        return
      }
      formatDocPlain(doc, this.log.bind(this))
    } catch (error) {
      const cross = await checkCrossProjectDoc(error, slug, jsonMode)
      if (cross.jsonOutput !== null) {
        this.log(JSON.stringify(cross.jsonOutput, null, 2))
        this.exit(1)
      }
      if (cross.hint !== null) {
        this.error(cross.hint)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }
  }
}
