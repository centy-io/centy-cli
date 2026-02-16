// eslint-disable-next-line import/order
import { Args, Command, Flags } from '@oclif/core'

import { daemonRegisterProject } from '../../daemon/daemon-register-project.js'
import { daemonInit } from '../../daemon/daemon-init.js'

/**
 * Register a project for tracking
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class RegisterProject extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override args = {
    path: Args.string({
      description: 'Path to the project (defaults to current directory)',
      required: false,
    }),
  }

  // eslint-disable-next-line no-restricted-syntax
  static override description = 'Register a project for tracking'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> register project',
    '<%= config.bin %> register project /path/to/project',
    '<%= config.bin %> register project --no-init',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    init: Flags.boolean({
      char: 'i',
      description: 'Initialize .centy folder if not already initialized',
      default: true,
      allowNo: true,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(RegisterProject)
    // eslint-disable-next-line no-restricted-syntax
    const projectPath = args.path ?? process.env['CENTY_CWD'] ?? process.cwd()

    const response = await daemonRegisterProject({
      projectPath,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Registered project "${response.project!.name}"`)
    this.log(`  Path: ${response.project!.path}`)

    // Auto-initialize if requested and not already initialized
    if (flags.init && !response.project!.initialized) {
      const initResponse = await daemonInit({
        projectPath,
        force: true,
      })

      if (!initResponse.success) {
        this.warn(`Failed to initialize: ${initResponse.error}`)
        this.log(`  Initialized: no`)
      } else {
        this.log(`  Initialized: yes (just now)`)
      }
    } else {
      this.log(`  Initialized: ${response.project!.initialized ? 'yes' : 'no'}`)
    }
  }
}
