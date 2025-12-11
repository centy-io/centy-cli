import { Args, Command, Flags } from '@oclif/core'

import { daemonRegisterProject } from '../../daemon/daemon-register-project.js'
import { daemonInit } from '../../daemon/daemon-init.js'

/**
 * Register a project for tracking
 */
export default class RegisterProject extends Command {
  static override args = {
    path: Args.string({
      description: 'Path to the project (defaults to current directory)',
      required: false,
    }),
  }

  static override description = 'Register a project for tracking'

  static override examples = [
    '<%= config.bin %> register project',
    '<%= config.bin %> register project /path/to/project',
    '<%= config.bin %> register project --no-init',
  ]

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
    const projectPath = args.path ?? process.env['CENTY_CWD'] ?? process.cwd()

    const response = await daemonRegisterProject({
      projectPath,
    })

    if (!response.success) {
      this.error(response.error)
    }

    this.log(`Registered project "${response.project.name}"`)
    this.log(`  Path: ${response.project.path}`)

    // Auto-initialize if requested and not already initialized
    if (flags.init && !response.project.initialized) {
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
      this.log(`  Initialized: ${response.project.initialized ? 'yes' : 'no'}`)
    }
  }
}
