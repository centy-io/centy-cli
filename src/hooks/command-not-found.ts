import { Hook } from '@oclif/core'
import { closest, distance } from 'fastest-levenshtein'

function findClosestCommand(
  id: string,
  commandIds: string[]
): string | undefined {
  if (commandIds.length === 0) return undefined
  const suggestion = closest(id, commandIds)
  const threshold = Math.max(3, Math.floor(id.length / 2))
  return distance(id, suggestion) <= threshold ? suggestion : undefined
}

const hook: Hook<'command_not_found'> = async function (opts) {
  const argv = opts.argv !== undefined ? opts.argv : []
  // argv may include the command id as first element — strip it if so
  const remaining = argv[0] === opts.id ? argv.slice(1) : argv

  // Intercept simple lowercase words as item type shorthands:
  //   centy <type> <id> [flags]  →  centy get <type> <id> [flags]
  //   centy <types> [flags]      →  centy list <types> [flags]
  if (!opts.id.includes(':') && /^[a-z][a-z-]*$/.test(opts.id)) {
    const firstArg = remaining[0]
    const hasId = firstArg !== undefined && !firstArg.startsWith('-')

    if (hasId) {
      await this.config.runCommand('get', [opts.id, ...remaining])
    } else {
      await this.config.runCommand('list', [opts.id, ...remaining])
    }
    return
  }

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
