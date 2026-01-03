import { writeFile } from 'node:fs/promises'
// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonGetPlan } from '../../daemon/daemon-get-plan.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Get an issue's plan
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class GetPlan extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['show:plan']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    issueId: Args.string({
      description: 'Issue ID or display number',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = "Get an issue's plan"

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> get plan 1',
    '<%= config.bin %> get plan abc123',
    '<%= config.bin %> get plan 1 --output ./plan.md',
    '<%= config.bin %> get plan 1 --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    output: Flags.string({
      char: 'o',
      description: 'Output file path (prints to stdout by default)',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(GetPlan)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const response = await daemonGetPlan({
      projectPath: cwd,
      issueId: args.issueId,
    })

    if (!response.exists) {
      this.error(`No plan found for issue ${args.issueId}`)
    }

    if (flags.output) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await writeFile(flags.output, response.content)
      this.log(`Saved plan to ${flags.output}`)
    } else {
      this.log(response.content)
    }
  }
}
