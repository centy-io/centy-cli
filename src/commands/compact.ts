import { writeFile } from 'node:fs/promises'
import { Command, Flags } from '@oclif/core'
import { daemonListUncompactedIssues } from '../daemon/daemon-list-uncompacted-issues.js'
import { projectFlag } from '../flags/project-flag.js'
import { applyLlmResponseFromFile } from '../lib/compact/apply-llm-response.js'
import { formatDryRun } from '../lib/compact/format-dry-run.js'
import { generateLlmContext } from '../lib/compact/generate-llm-context.js'
import {
  ensureInitialized,
  NotInitializedError,
} from '../utils/ensure-initialized.js'
import { resolveProjectPath } from '../utils/resolve-project-path.js'

/**
 * Compact uncompacted issues into features
 */

export default class Compact extends Command {
  static override description =
    'Compact uncompacted issues into feature summaries'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    'dry-run': Flags.boolean({
      char: 'd',
      description: 'List uncompacted issues without modifying',
      default: false,
    }),
    output: Flags.string({
      char: 'o',
      description: 'Write LLM context to file (for external LLM processing)',
    }),
    input: Flags.string({
      char: 'i',
      description: 'Read LLM response from file and apply changes',
    }),
    json: Flags.boolean({
      description: 'Output as JSON (for --dry-run)',
      default: false,
    }),
    project: projectFlag,
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Compact)
    const cwd = await resolveProjectPath(flags.project)

    try {
      await ensureInitialized(cwd)
    } catch (error) {
      if (error instanceof NotInitializedError) {
        this.error(error.message)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (flags.input !== undefined) {
      await this.applyInput(cwd, flags.input)
      return
    }

    const response = await daemonListUncompactedIssues({ projectPath: cwd })
    if (response.issues.length === 0) {
      this.log('No new issues to compact.')
      return
    }

    if (flags['dry-run']) {
      formatDryRun(response, flags.json).forEach(line => this.log(line))
      return
    }

    const context = await generateLlmContext(
      cwd,
      response.issues.map(item => ({
        id: item.id,
        displayNumber: item.metadata ? item.metadata.displayNumber : 0,
        title: item.title,
        description: item.body,
      }))
    )
    if (flags.output !== undefined) {
      await writeFile(flags.output, context, 'utf-8')
      this.log(
        `LLM context written to: ${flags.output}\n\nNext steps:\n1. Process the file with your LLM\n2. Run: centy compact --input <response-file>`
      )
      return
    }

    this.log(context)
  }

  private async applyInput(cwd: string, inputFile: string): Promise<void> {
    try {
      const result = await applyLlmResponseFromFile(cwd, inputFile)
      if (result.migrationFilename !== null) {
        this.log(`Migration saved: ${result.migrationFilename}`)
      }
      if (result.compactUpdated) {
        this.log('compact.md updated')
      }
      if (result.noIdsFound) {
        const noIdsMsg =
          'No issue IDs found in migration content. Issues will not be marked as compacted.'
        this.warn(noIdsMsg)
      } else {
        this.log(`Marked ${result.markedCount} issue(s) as compacted`)
      }
      this.log('Compaction applied successfully!')
    } catch (error) {
      this.error(error instanceof Error ? error.message : String(error))
    }
  }
}
