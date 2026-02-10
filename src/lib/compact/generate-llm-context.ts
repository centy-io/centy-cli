import { daemonGetCompact } from '../../daemon/daemon-get-compact.js'
import { daemonGetInstruction } from '../../daemon/daemon-get-instruction.js'

export async function generateLlmContext(
  projectPath: string,
  issues: Array<{
    id: string
    displayNumber: number
    title: string
    description: string
  }>
): Promise<string> {
  const instructionResponse = await daemonGetInstruction({ projectPath })
  const instruction = instructionResponse.content

  const compactResponse = await daemonGetCompact({ projectPath })
  const currentCompact = compactResponse.exists
    ? compactResponse.content
    : '(No features documented yet)'

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
