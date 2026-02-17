// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetItem } from '../../daemon/daemon-get-item.js'
import { daemonGetIssuesByUuid } from '../../daemon/daemon-get-issues-by-uuid.js'
import { projectFlag } from '../../flags/project-flag.js'
import { formatGenericItem } from '../../lib/get-item/format-generic-item.js'
import { handleGlobalIssueSearch } from '../../lib/get-issue/handle-global-search.js'
import { handleIssueNotInitialized } from '../../lib/get-issue/handle-not-initialized.js'
import { isValidUuid } from '../../utils/cross-project-search.js'
import { ensureInitialized } from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Get a single issue by ID or display number
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class GetIssue extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['show:issue', 'issue']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    id: Args.string({
      description: 'Issue ID (UUID) or display number',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Get a single issue by ID or display number'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> get issue 1',
    '<%= config.bin %> get issue abc123-uuid',
    '<%= config.bin %> get issue 1 --json',
    '<%= config.bin %> get issue abc12345-1234-1234-1234-123456789abc --global',
    '<%= config.bin %> get issue abc12345-1234-1234-1234-123456789abc -g --json',
    '<%= config.bin %> get issue 1 --project centy-daemon',
    '<%= config.bin %> get issue 1 --project /path/to/project',
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
    const { args, flags } = await this.parse(GetIssue)
    const cwd = await resolveProjectPath(flags.project)

    if (flags.global) {
      if (!isValidUuid(args.id)) {
        this.error(
          'Global search requires a valid UUID. Display numbers are not supported for global search.'
        )
      }
      const result = await daemonGetIssuesByUuid({ uuid: args.id })
      if (flags.json) {
        this.log(JSON.stringify(result, null, 2))
        return
      }
      handleGlobalIssueSearch(
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
      const result = await handleIssueNotInitialized(error, args.id, flags.json)
      if (result !== null) {
        if (result.jsonOutput !== undefined) {
          this.log(JSON.stringify(result.jsonOutput, null, 2))
          this.exit(1)
        }
        this.error(result.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonGetItem({
      projectPath: cwd,
      itemType: 'issues',
      itemId: args.id,
    })

    if (!response.success) {
      this.error(response.error)
    }

    if (flags.json) {
      this.log(JSON.stringify(response.item, null, 2))
      return
    }

    formatGenericItem(response.item!, this.log.bind(this))
  }
}
