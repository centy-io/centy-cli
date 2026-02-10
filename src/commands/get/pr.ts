// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetPrsByUuid } from '../../daemon/daemon-get-prs-by-uuid.js'
import { projectFlag } from '../../flags/project-flag.js'
import { fetchAndDisplayPr } from '../../lib/get-pr/fetch-and-display.js'
import { handleGlobalPrSearch } from '../../lib/get-pr/handle-global-search.js'
import { handlePrNotInitialized } from '../../lib/get-pr/handle-not-initialized.js'
import { isValidUuid } from '../../utils/cross-project-search.js'
import { ensureInitialized } from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Get a single pull request by ID or display number
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class GetPr extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['show:pr']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'PR ID (UUID) or display number',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Get a single pull request by ID or display number'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> get pr 1',
    '<%= config.bin %> get pr abc123-uuid',
    '<%= config.bin %> get pr 1 --json',
    '<%= config.bin %> get pr abc12345-1234-1234-1234-123456789abc --global',
    '<%= config.bin %> get pr abc12345-1234-1234-1234-123456789abc -g --json',
    '<%= config.bin %> get pr 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    global: Flags.boolean({
      char: 'g',
      description: 'Search across all tracked projects (UUID only)',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetPr)
    const cwd = await resolveProjectPath(flags.project)

    if (flags.global) {
      if (!isValidUuid(args.id)) {
        this.error(
          'Global search requires a valid UUID. Display numbers are not supported for global search.'
        )
      }
      const result = await daemonGetPrsByUuid({ uuid: args.id })
      if (flags.json) {
        this.log(JSON.stringify(result, null, 2))
        return
      }
      handleGlobalPrSearch(
        result,
        args.id,
        this.log.bind(this),
        this.warn.bind(this)
      )
      return
    }

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      const result = await handlePrNotInitialized(error, args.id, flags.json)
      if (result !== null) {
        if (result.jsonOutput !== undefined) {
          this.log(JSON.stringify(result.jsonOutput, null, 2))
          this.exit(1)
        }
        this.error(result.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const ctx = {
      log: this.log.bind(this),
      error: this.error.bind(this),
      exit: this.exit.bind(this),
    }
    await fetchAndDisplayPr(cwd, args.id, flags.json, ctx)
  }
}
