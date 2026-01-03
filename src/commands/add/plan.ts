import { readFile } from 'node:fs/promises'
// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonUpdatePlan } from '../../daemon/daemon-update-plan.js'
import { projectFlag } from '../../flags/project-flag.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../../utils/ensure-initialized.js'
import { resolveProjectPath } from '../../utils/resolve-project-path.js'

/**
 * Add or update an issue's plan
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class AddPlan extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override aliases = ['update:plan', 'set:plan']

  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    issueId: Args.string({
      description: 'Issue ID or display number',
      required: true,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = "Add or update an issue's plan"

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> add plan 1 --file ./plan.md',
    '<%= config.bin %> add plan abc123 --file ./plan.md',
    'echo "# Plan" | <%= config.bin %> add plan 1',
    '<%= config.bin %> add plan 1 --project centy-daemon --file ./plan.md',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    file: Flags.string({
      char: 'f',
      description: 'Path to the plan file (reads from stdin if not provided)',
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(AddPlan)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    let content: string

    if (flags.file) {
      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        content = await readFile(flags.file, 'utf-8')
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        if (msg.includes('ENOENT')) {
          this.error(`File not found: ${flags.file}`)
        }
        throw error instanceof Error ? error : new Error(String(error))
      }
    } else if (!process.stdin.isTTY) {
      // Read from stdin
      const chunks: Buffer[] = []
      for await (const chunk of process.stdin) {
        chunks.push(Buffer.from(chunk))
      }
      content = Buffer.concat(chunks).toString('utf-8')
    } else {
      this.error('No input provided. Use --file or pipe content via stdin.')
    }

    const response = await daemonUpdatePlan({
      projectPath: cwd,
      issueId: args.issueId,
      content,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Plan updated for issue ${args.issueId}`)
  }
}
