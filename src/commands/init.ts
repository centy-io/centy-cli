// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { init } from '../lib/init/index.js'

/**
 * Initialize a .centy folder in the current project
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Init extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Initialize a .centy folder in the current project'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --force',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    force: Flags.boolean({
      char: 'f',
      description: 'Skip interactive prompts and use defaults',
      default: false,
    }),
    // Config flags
    'priority-levels': Flags.integer({
      description: 'Number of priority levels (1-10, default: 3)',
      min: 1,
      max: 10,
    }),
    'default-state': Flags.string({
      description: 'Default state for new issues (default: "open")',
    }),
    'allowed-states': Flags.string({
      description: 'Comma-separated list of allowed states',
    }),
    version: Flags.string({
      description: 'Project version (semver)',
    }),
    // LLM flags
    'llm-auto-close': Flags.boolean({
      description: 'Auto-close issues when LLM completes work',
      allowNo: true,
    }),
    'llm-update-status': Flags.boolean({
      description: 'Update status to in-progress when LLM starts',
      allowNo: true,
    }),
    'llm-allow-direct-edits': Flags.boolean({
      description: 'Allow LLM to directly edit issue files',
      allowNo: true,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Init)

    // Allow CENTY_CWD env var to override working directory (for testing)
    // eslint-disable-next-line no-restricted-syntax
    const cwd = process.env['CENTY_CWD']

    // Parse allowed-states if provided
    const allowedStates = flags['allowed-states']
      ? flags['allowed-states'].split(',').map(s => s.trim())
      : undefined

    const result = await init({
      force: flags.force,
      cwd,
      priorityLevels: flags['priority-levels'],
      defaultState: flags['default-state'],
      allowedStates,
      version: flags.version,
      llmAutoClose: flags['llm-auto-close'],
      llmUpdateStatus: flags['llm-update-status'],
      llmAllowDirectEdits: flags['llm-allow-direct-edits'],
    })

    if (!result.success) {
      this.exit(1)
    }
  }
}
