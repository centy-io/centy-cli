import { Hook } from '@oclif/core'

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function findClosestCommand(id: string, commandIds: string[]): string | undefined {
  if (commandIds.length === 0) return undefined
  let closest = commandIds[0]
  let minDist = levenshtein(id, closest)
  for (const cmd of commandIds.slice(1)) {
    const dist = levenshtein(id, cmd)
    if (dist < minDist) {
      minDist = dist
      closest = cmd
    }
  }
  // Only suggest if reasonably close (distance <= half the command length)
  const threshold = Math.max(3, Math.floor(id.length / 2))
  return minDist <= threshold ? closest : undefined
}

const hook: Hook<'command_not_found'> = async function (opts) {
  const commandIds = opts.config.commandIDs.filter(id => !id.includes(':'))

  const suggestion = findClosestCommand(opts.id, commandIds)
  const suggestionLine = suggestion ? `  Did you mean: ${suggestion}\n` : ''

  const message = [
    `Command "${opts.id}" not found.`,
    '',
    suggestionLine + `  Usage: centy <command> [subcommand] [args] [flags]`,
    '',
    `  Run \`centy --help\` to see all available commands.`,
    '',
    `  AI/LLM assistant? Run \`centy llm\` to get full instructions for working with this CLI.`,
    '',
    `  Think this command should exist? Open an issue:`,
    `  gh issue create --repo centy-io/centy-cli --title "Missing command: ${opts.id}"`,
  ].join('\n')

  this.error(message, { exit: 2 })
}

export default hook
