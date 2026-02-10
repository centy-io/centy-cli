import type { Issue } from '../../daemon/types.js'

interface DryRunInput {
  issues: Issue[]
  totalCount: number
}

export function formatDryRun(
  response: DryRunInput,
  jsonMode: boolean
): string[] {
  if (jsonMode) {
    return [JSON.stringify(response.issues, null, 2)]
  }

  const lines: string[] = [
    `Found ${response.totalCount} uncompacted issue(s):\n`,
  ]
  for (const issue of response.issues) {
    const meta = issue.metadata
    const status = meta !== undefined ? meta.status : 'unknown'
    lines.push(`#${issue.displayNumber} [${status}] ${issue.title}`)
  }
  return lines
}
