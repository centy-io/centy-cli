import { writeFile, readFile } from 'node:fs/promises'

import { Command, Flags } from '@oclif/core'

import { daemonGetCompact } from '../daemon/daemon-get-compact.js'
import { daemonGetInstruction } from '../daemon/daemon-get-instruction.js'
import { daemonIsInitialized } from '../daemon/daemon-is-initialized.js'
import { daemonListUncompactedIssues } from '../daemon/daemon-list-uncompacted-issues.js'
import { daemonMarkIssuesCompacted } from '../daemon/daemon-mark-issues-compacted.js'
import { daemonSaveMigration } from '../daemon/daemon-save-migration.js'
import { daemonUpdateCompact } from '../daemon/daemon-update-compact.js'

/**
 * Compact uncompacted issues into features
 */
export default class Compact extends Command {
  static override description =
    'Compact uncompacted issues into feature summaries'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --dry-run',
    '<%= config.bin %> <%= command.id %> --output context.md',
    '<%= config.bin %> <%= command.id %> --input response.md',
  ]

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
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(Compact)
    const cwd = process.env['CENTY_CWD'] ?? process.cwd()

    // Check if initialized
    const initStatus = await daemonIsInitialized({ projectPath: cwd })
    if (!initStatus.initialized) {
      this.error('.centy folder not initialized. Run "centy init" first.')
    }

    // If input file provided, apply LLM response
    if (flags.input !== undefined) {
      await this.applyLlmResponse(cwd, flags.input)
      return
    }

    // Get uncompacted issues
    const response = await daemonListUncompactedIssues({ projectPath: cwd })

    if (response.issues.length === 0) {
      this.log('No new issues to compact.')
      return
    }

    // Dry run - just show issues
    if (flags['dry-run']) {
      if (flags.json) {
        this.log(JSON.stringify(response.issues, null, 2))
      } else {
        this.log(`Found ${response.totalCount} uncompacted issue(s):\n`)
        for (const issue of response.issues) {
          const meta = issue.metadata
          const status = meta !== undefined ? meta.status : 'unknown'
          this.log(`#${issue.displayNumber} [${status}] ${issue.title}`)
        }
      }
      return
    }

    // Generate LLM context
    const context = await this.generateLlmContext(cwd, response.issues)

    // If output file provided, write context
    if (flags.output !== undefined) {
      await writeFile(flags.output, context, 'utf-8')
      this.log(`LLM context written to: ${flags.output}`)
      this.log(
        `\nNext steps:\n1. Process the file with your LLM\n2. Run: centy compact --input <response-file>`
      )
      return
    }

    // Output context to stdout for piping
    this.log(context)
  }

  private async generateLlmContext(
    projectPath: string,
    issues: Array<{
      id: string
      displayNumber: number
      title: string
      description: string
    }>
  ): Promise<string> {
    // Get instruction.md
    const instructionResponse = await daemonGetInstruction({ projectPath })
    const instruction = instructionResponse.content

    // Get current compact.md
    const compactResponse = await daemonGetCompact({ projectPath })
    const currentCompact = compactResponse.exists
      ? compactResponse.content
      : '(No features documented yet)'

    // Build context
    const parts: string[] = []

    parts.push('# LLM Compaction Context\n')
    parts.push('## Instructions\n')
    parts.push(instruction)
    parts.push('\n---\n')
    parts.push('## Current Features Summary (compact.md)\n')
    parts.push('```markdown')
    parts.push(currentCompact)
    parts.push('```')
    parts.push('\n---\n')
    parts.push('## Uncompacted Issues\n')

    for (const issue of issues) {
      parts.push(`### Issue #${issue.displayNumber}: ${issue.title}`)
      parts.push(`**ID:** ${issue.id}`)
      parts.push('')
      parts.push(issue.description || '(No description)')
      parts.push('')
    }

    return parts.join('\n')
  }

  private async applyLlmResponse(
    projectPath: string,
    inputFile: string
  ): Promise<void> {
    // Read LLM response
    const content = await readFile(inputFile, 'utf-8')

    // Parse response - look for MIGRATION_CONTENT and COMPACT_CONTENT sections
    const migrationMatch = content.match(
      /### MIGRATION_CONTENT\s*\n```(?:markdown|yaml)?\s*\n([\s\S]*?)```/i
    )
    const compactMatch = content.match(
      /### COMPACT_CONTENT\s*\n```(?:markdown)?\s*\n([\s\S]*?)```/i
    )

    if (migrationMatch === null && compactMatch === null) {
      // Try alternative formats - look for sections without code blocks
      const altMigrationMatch = content.match(
        /### MIGRATION_CONTENT\s*\n([\s\S]*?)(?=### COMPACT_CONTENT|$)/i
      )
      const altCompactMatch = content.match(
        /### COMPACT_CONTENT\s*\n([\s\S]*?)$/i
      )

      if (altMigrationMatch === null && altCompactMatch === null) {
        this.error(
          'Could not parse LLM response. Expected MIGRATION_CONTENT and COMPACT_CONTENT sections.'
        )
      }

      if (altMigrationMatch !== null) {
        await this.saveMigrationContent(
          projectPath,
          altMigrationMatch[1].trim()
        )
      }
      if (altCompactMatch !== null) {
        await this.saveCompactContent(projectPath, altCompactMatch[1].trim())
      }
    } else {
      if (migrationMatch !== null) {
        await this.saveMigrationContent(projectPath, migrationMatch[1])
      }
      if (compactMatch !== null) {
        await this.saveCompactContent(projectPath, compactMatch[1])
      }
    }

    // Mark issues as compacted - extract issue IDs from migration content
    await this.markIssuesFromMigration(projectPath, content)

    this.log('Compaction applied successfully!')
  }

  private async saveMigrationContent(
    projectPath: string,
    content: string
  ): Promise<void> {
    const response = await daemonSaveMigration({
      projectPath,
      content,
    })

    if (!response.success) {
      this.error(`Failed to save migration: ${response.error}`)
    }

    this.log(`Migration saved: ${response.filename}`)
  }

  private async saveCompactContent(
    projectPath: string,
    content: string
  ): Promise<void> {
    const response = await daemonUpdateCompact({
      projectPath,
      content,
    })

    if (!response.success) {
      this.error(`Failed to update compact.md: ${response.error}`)
    }

    this.log('compact.md updated')
  }

  private async markIssuesFromMigration(
    projectPath: string,
    content: string
  ): Promise<void> {
    // Extract issue IDs from the migration content
    // Look for patterns like:
    // - id: uuid-123
    // or compactedIssues array
    const idMatches = content.matchAll(
      /(?:id|issueId):\s*["']?([a-f0-9-]{36})["']?/gi
    )
    const issueIds: string[] = []

    for (const match of idMatches) {
      if (!issueIds.includes(match[1])) {
        issueIds.push(match[1])
      }
    }

    if (issueIds.length === 0) {
      this.warn(
        'No issue IDs found in migration content. Issues will not be marked as compacted.'
      )
      return
    }

    const response = await daemonMarkIssuesCompacted({
      projectPath,
      issueIds,
    })

    if (!response.success) {
      this.error(`Failed to mark issues as compacted: ${response.error}`)
    }

    this.log(`Marked ${response.markedCount} issue(s) as compacted`)
  }
}
