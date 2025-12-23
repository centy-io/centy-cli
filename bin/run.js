#!/usr/bin/env node
import { execute } from '@oclif/core'

// Check if running with no arguments (or just --interactive flag)
const args = process.argv.slice(2)
const hasCommand = args.length > 0 && !args[0].startsWith('-')
const isHelp = args.includes('--help') || args.includes('-h')
const isVersion = args.includes('--version') || args.includes('-v')
const isInteractive = args.includes('--interactive') || args.includes('-i')

// Handle --version/-v flag: show CLI and daemon versions
if (isVersion) {
  const { createRequire } = await import('module')
  const require = createRequire(import.meta.url)
  const packageJson = require('../package.json')
  console.log(`CLI: ${packageJson.version}`)

  // Try to get daemon version
  try {
    const { daemonGetDaemonInfo } =
      await import('../dist/daemon/daemon-get-daemon-info.js')
    const daemonInfo = await daemonGetDaemonInfo({})
    console.log(`Daemon: ${daemonInfo.version}`)
  } catch {
    console.log(`Daemon: not running`)
  }
} else if ((!hasCommand && !isHelp) || isInteractive) {
  // Launch TUI mode if no command provided (or explicit --interactive flag)
  const { startTUI } = await import('../dist/tui/index.js')
  await startTUI()
} else {
  await execute({ dir: import.meta.url })
}
