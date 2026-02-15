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
    'allowed-states': Flags.string({
      description: 'Comma-separated list of allowed states',
    }),
    version: Flags.string({
      description: 'Project version (semver)',
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
      allowedStates,
      version: flags.version,
    })

    if (!result.success) {
      this.exit(1)
    }
  }
}
