// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import {
  formatIssueResults,
  formatPrResults,
} from '../lib/show/format-results.js'
import { searchEntitiesByUuid } from '../lib/show/search-entities.js'
import { isValidUuid } from '../utils/is-valid-uuid.js'

/**
 * Show an entity by UUID, auto-detecting type across all tracked projects
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Show extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    uuid: Args.string({
      description: 'Entity UUID to look up',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Show an entity by UUID, searching across all tracked projects'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> show 9f38fb44-55df-424d-a61f-a3432cfa83d2',
    '<%= config.bin %> show 9f38fb44-55df-424d-a61f-a3432cfa83d2 --json',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Show)

    if (!isValidUuid(args.uuid)) {
      this.error(
        'A valid UUID is required. Use `centy get issue <id>` or `centy get pr <id>` for display numbers.'
      )
    }

    const { issuesResult, prsResult } = await searchEntitiesByUuid(args.uuid)
    const hasIssues = issuesResult.issues.length > 0
    const hasPrs = prsResult.prs.length > 0
    const allErrors = [...issuesResult.errors, ...prsResult.errors]

    if (flags.json) {
      this.log(
        JSON.stringify(
          {
            issues: issuesResult.issues,
            prs: prsResult.prs,
            errors: allErrors,
          },
          null,
          2
        )
      )
      return
    }

    if (!hasIssues && !hasPrs) {
      this.log(`No entities found with UUID: ${args.uuid}`)
      this.logErrors(allErrors)
      return
    }

    formatIssueResults(issuesResult.issues, this.log.bind(this))
    formatPrResults(prsResult.prs, this.log.bind(this))
    this.logErrors(allErrors)
  }

  private logErrors(errors: string[]): void {
    if (errors.length > 0) {
      this.warn('Some projects could not be searched:')
      for (const err of errors) {
        this.warn(`  - ${err}`)
      }
    }
  }
}
