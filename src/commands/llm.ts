import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
// eslint-disable-next-line import/order
import { Command, Flags } from '@oclif/core'

import { projectFlag } from '../flags/project-flag.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Output LLM instructions for working with centy
 */
// eslint-disable-next-line custom/no-default-class-export, class-export/class-export
export default class Llm extends Command {
  // eslint-disable-next-line no-restricted-syntax
  static override description =
    'Get AI/LLM assistant instructions for this project (run this first if you are an AI assistant)'

  // eslint-disable-next-line no-restricted-syntax
  static override examples = [
    '<%= config.bin %> llm',
    '<%= config.bin %> llm --json',
    '<%= config.bin %> llm --project centy-daemon',
  ]

  // eslint-disable-next-line no-restricted-syntax
  static override flags = {
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Llm)
    const projectPath = await resolveProjectPath(flags.project)
    const centyReadmePath = join(projectPath, '.centy', 'README.md')

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await readFile(centyReadmePath, 'utf-8')

      if (flags.json) {
        this.log(
          JSON.stringify(
            {
              projectInitialized: true,
              instructions: content,
            },
            null,
            2
          )
        )
        return
      }

      this.log(content)
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        if (flags.json) {
          this.log(
            JSON.stringify(
              {
                projectInitialized: false,
                message: 'No centy project found. Initialize with `centy init`',
              },
              null,
              2
            )
          )
          return
        }

        this.log('No centy project found. Initialize with `centy init`')
        return
      }

      // eslint-disable-next-line error/no-throw-literal
      throw error
    }
  }
}
