#!/usr/bin/env node

/**
 * Centy CLI - Project management via code
 */

import { getVersion } from './index.js'

function main(): void {
  const args = process.argv.slice(2)

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`centy v${getVersion()}`)
    return
  }

  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
centy - Project management via code

Usage:
  centy [command] [options]

Commands:
  init          Initialize a .centy folder in the current project
  issue         Manage issues
  docs          Manage documentation

Options:
  -v, --version Show version number
  -h, --help    Show help

Examples:
  centy init              Initialize centy in current project
  centy issue list        List all issues
  centy issue create      Create a new issue
  centy docs list         List all documentation
`)
    return
  }

  console.log(`Unknown command: ${args[0]}`)
  console.log('Run "centy --help" for usage information.')
  process.exit(1)
}

main()
