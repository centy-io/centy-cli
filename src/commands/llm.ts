import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Command, Flags } from '@oclif/core'
import { projectFlag } from '../flags/project-flag.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Output LLM instructions for working with centy
 */

export default class Llm extends Command {

  static override description =
    'Get AI/LLM assistant instructions for this project (run this first if you are an AI assistant)'


  static override examples = [
    '<%= config.bin %> llm',
    '<%= config.bin %> llm --json',
    '<%= config.bin %> llm --project centy-daemon',
  ]


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

      throw error instanceof Error ? error : new Error(String(error))
    }
  }
}
