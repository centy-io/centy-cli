import { Command, Flags } from '@oclif/core'

import { daemonGetConfig } from '../daemon/daemon-get-config.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'

/**
 * Get the project configuration
 */
export default class Config extends Command {
  static override description = 'Get the project configuration'

  static override examples = [
    '<%= config.bin %> config',
    '<%= config.bin %> config --json',
  ]

  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Config)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    const config = await daemonGetConfig({
      projectPath: cwd,
    })

    if (flags.json) {
      this.log(JSON.stringify(config, null, 2))
      return
    }

    this.log(`Centy Configuration`)
    this.log(`\nDefaults:`)
    for (const [key, value] of Object.entries(config.defaults)) {
      this.log(`  ${key}: ${value}`)
    }

    if (config.customFields.length > 0) {
      this.log(`\nCustom Fields:`)
      for (const field of config.customFields) {
        const required = field.required ? ' (required)' : ''
        this.log(`  ${field.name}: ${field.fieldType}${required}`)
        if (field.defaultValue) {
          this.log(`    Default: ${field.defaultValue}`)
        }
        if (field.enumValues.length > 0) {
          this.log(`    Values: ${field.enumValues.join(', ')}`)
        }
      }
    }
  }
}
